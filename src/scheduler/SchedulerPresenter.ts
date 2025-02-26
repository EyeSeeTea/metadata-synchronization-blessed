import { CompositionRoot } from "../presentation/CompositionRoot";
import { SchedulerContract } from "./entities/SchedulerContract";
import { getLogger } from "log4js";
import cronstrue from "cronstrue";
import _ from "lodash";
import moment from "moment";
import { SynchronizationRule } from "../domain/rules/entities/SynchronizationRule";
import { DEFAULT_SCHEDULED_JOB_ID } from "./Scheduler";

const DEFAULT_CODE = "__default__";

export class SchedulerPresenter {
    constructor(private schedulerContract: SchedulerContract, private compositionRoot: CompositionRoot) {}

    public initialize(apiPath: string): void {
        this.fetchTask(apiPath);

        this.schedulerContract.scheduleJob({ jobCallback: (): Promise<void> => this.fetchTask(apiPath) });

        getLogger("main").info(`Loading synchronization rules from remote server`);
    }

    private async fetchTask(apiPath: string): Promise<void> {
        try {
            const { rows: rules } = await this.compositionRoot.rules.list({ paging: false });

            const jobs = _.filter(rules, rule => rule.enabled);
            const enabledJobIds = jobs.map(({ id }) => id);
            getLogger("scheduler").trace(`There are ${jobs.length} total jobs scheduled`);

            // Cancel disabled jobs that were scheduled
            const scheduledJobs = this.schedulerContract.getScheduledJobs();

            const currentJobIds = scheduledJobs.map(({ id }) => id);
            const newJobs = _.reject(jobs, ({ id }) => currentJobIds.includes(id));
            const idsToCancel = _.difference(currentJobIds, enabledJobIds, [DEFAULT_CODE]);
            idsToCancel.forEach((id: string) => {
                getLogger("scheduler").info(`Cancelling disabled rule with id ${id}`);
                const scheduledJobToCancel = scheduledJobs.find(scheduledJob => scheduledJob.id === id);
                if (scheduledJobToCancel) {
                    this.schedulerContract.cancelJob(scheduledJobToCancel.id);
                }
            });

            // Create or update enabled jobs
            newJobs.forEach((syncRule: SynchronizationRule): void => {
                const { id, name, frequency } = syncRule;

                if (id && frequency) {
                    const job = this.schedulerContract.scheduleJob({
                        jobId: id,
                        frequency: frequency,
                        jobCallback: (): Promise<void> => this.synchronizationTask(id, apiPath),
                    });

                    // Format date to keep timezone offset
                    const nextDate = moment(job.nextExecution.toISOString()).toISOString(true);
                    getLogger("scheduler").info(`Scheduling new sync rule ${name} (${id}) at ${nextDate}`);
                }
            });

            const defaultScheduledJob = scheduledJobs.find(
                scheduledJob => scheduledJob.id === DEFAULT_SCHEDULED_JOB_ID
            );

            const nextExecution = defaultScheduledJob?.nextExecution;
            const lastExecution = await this.compositionRoot.scheduler.getLastExecution();
            await this.compositionRoot.scheduler.updateLastExecution({ ...lastExecution, nextExecution });
        } catch (error) {
            getLogger("scheduler").error(error);
        }
    }

    private async synchronizationTask(ruleId: string, apiPath: string): Promise<void> {
        const rule = await this.compositionRoot.rules.get(ruleId);
        if (!rule) return;

        const { name, frequency, builder, id: syncRule, type = "metadata" } = rule;

        try {
            const readableFrequency = cronstrue.toString(frequency || "");
            getLogger(name).debug(`Start ${type} rule with frequency: ${readableFrequency}`);
            const result = await this.compositionRoot.sync.prepare(type, builder);
            const sync = this.compositionRoot.sync[type]({ ...builder, syncRule });

            const synchronize = async () => {
                for await (const { message, syncReport, done } of sync.execute()) {
                    if (message) getLogger(name).debug(message);
                    if (syncReport) await this.compositionRoot.reports.save(syncReport);
                    if (done && syncReport && syncReport.id) {
                        const reportUrl = this.buildUrl(apiPath, type, syncReport.id);
                        getLogger(name).debug(`Finished. Report available at ${reportUrl}`);
                    } else if (done) getLogger(name).warn(`Finished with errors`);
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
                            getLogger(name).error("Metadata has a custodian, unable to proceed with sync");
                            break;
                        case "INSTANCE_NOT_FOUND":
                            getLogger(name).error("Couldn't connect with instance");
                            break;
                        case "NOT_AUTHORIZED":
                            getLogger(name).error("User is not authorized to one or more instances");
                            break;
                        default:
                            getLogger(name).error("Unknown synchronization error");
                    }
                },
            });
        } catch (error: any) {
            getLogger(name).error(`Failed executing rule`, error);
        }
    }

    private buildUrl(apiPath: string, type: string, id: string): string {
        return `${apiPath}/apps/MetaData-Synchronization/index.html#/history/${type}/${id}`;
    }
}
