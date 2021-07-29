import cronstrue from "cronstrue";
import _ from "lodash";
import { getLogger } from "log4js";
import moment from "moment";
import schedule from "node-schedule";
import { SynchronizationRule } from "../domain/rules/entities/SynchronizationRule";
import { CompositionRoot } from "../presentation/CompositionRoot";
import { D2Api } from "../types/d2-api";

export default class Scheduler {
    constructor(private api: D2Api, private compositionRoot: CompositionRoot) {}

    private synchronizationTask = async (id: string): Promise<void> => {
        const rule = await this.compositionRoot.rules.get(id);
        if (!rule) return;

        const { name, frequency, builder, id: syncRule, type = "metadata" } = rule;

        const logger = getLogger(name);
        try {
            const readableFrequency = cronstrue.toString(frequency || "");
            logger.debug(`Start ${type} rule with frequency: ${readableFrequency}`);
            const result = await this.compositionRoot.sync.prepare(type, builder);
            const sync = this.compositionRoot.sync[type]({ ...builder, syncRule });

            const synchronize = async () => {
                for await (const { message, syncReport, done } of sync.execute()) {
                    if (message) logger.debug(message);
                    if (syncReport) await this.compositionRoot.reports.save(syncReport);
                    if (done && syncReport && syncReport.id) {
                        const reportUrl = this.buildUrl(type, syncReport.id);
                        logger.debug(`Finished. Report available at ${reportUrl}`);
                    } else if (done) logger.warn(`Finished with errors`);
                }
            };

            await result.match({
                success: async () => {
                    await synchronize();
                },
                error: async code => {
                    switch (code) {
                        case "PULL_REQUEST":
                        case "PULL_REQUEST_RESPONSIBLE":
                            logger.error("Metadata has a custodian, unable to proceed with sync");
                            break;
                        case "INSTANCE_NOT_FOUND":
                            logger.error("Couldn't connect with instance");
                            break;
                        case "NOT_AUTHORIZED":
                            logger.error("User is not authorized to one or more instances");
                            break;
                        default:
                            logger.error("Unknown synchronization error");
                    }
                },
            });
        } catch (error) {
            logger.error(`Failed executing rule`, error);
        }
    };

    private fetchTask = async (): Promise<void> => {
        const { rows: rules } = await this.compositionRoot.rules.list({ paging: false });

        const jobs = _.filter(rules, rule => rule.enabled);
        const enabledJobIds = jobs.map(({ id }) => id);
        getLogger("scheduler").trace(`There are ${jobs.length} total jobs scheduled`);

        // Cancel disabled jobs that were scheduled
        const currentJobIds = _.keys(schedule.scheduledJobs);
        const newJobs = _.reject(jobs, ({ id }) => currentJobIds.includes(id));
        const idsToCancel = _.difference(currentJobIds, enabledJobIds, ["__default__"]);
        idsToCancel.forEach((id: string) => {
            getLogger("scheduler").info(`Cancelling disabled rule with id ${id}`);
            schedule.scheduledJobs[id].cancel();
        });

        // Create or update enabled jobs
        newJobs.forEach((syncRule: SynchronizationRule): void => {
            const { id, name, frequency } = syncRule;

            if (id && frequency) {
                const job = schedule.scheduleJob(
                    id,
                    frequency,
                    (): Promise<void> => this.synchronizationTask(id)
                );
                // Format date to keep timezone offset
                const nextDate = moment(job.nextInvocation().toISOString()).toISOString(true);
                getLogger("scheduler").info(
                    `Scheduling new sync rule ${name} (${id}) at ${nextDate}`
                );
            }
        });
    };

    private buildUrl(type: string, id: string): string {
        return `${this.api.apiPath}/apps/MetaData-Synchronization/index.html#/history/${type}/${id}`;
    }

    public initialize(): void {
        // Execute fetch task immediately
        this.fetchTask();

        // Schedule periodic fetch task every minute
        schedule.scheduleJob("__default__", "0 * * * * *", this.fetchTask);

        getLogger("main").info(`Loading synchronization rules from remote server`);
    }
}
