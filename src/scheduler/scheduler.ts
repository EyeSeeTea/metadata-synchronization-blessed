import cronstrue from "cronstrue";
import _ from "lodash";
import { getLogger } from "log4js";
import schedule from "node-schedule";
import { AggregatedSyncUseCase } from "../domain/aggregated/usecases/AggregatedSyncUseCase";
import { EventsSyncUseCase } from "../domain/events/usecases/EventsSyncUseCase";
import { DeletedMetadataSyncUseCase } from "../domain/metadata/usecases/DeletedMetadataSyncUseCase";
import { MetadataSyncUseCase } from "../domain/metadata/usecases/MetadataSyncUseCase";
import {
    SynchronizationRule,
    SyncRuleType,
} from "../domain/synchronization/entities/SynchronizationRule";
import { SyncronizationClass } from "../domain/synchronization/usecases/GenericSyncUseCase";
import SyncRule from "../models/syncRule";
import { D2Api } from "../types/d2-api";

const config: Record<SyncRuleType, { SyncClass: SyncronizationClass }> = {
    metadata: {
        SyncClass: MetadataSyncUseCase,
    },
    aggregated: {
        SyncClass: AggregatedSyncUseCase,
    },
    events: {
        SyncClass: EventsSyncUseCase,
    },
    deleted: {
        SyncClass: DeletedMetadataSyncUseCase,
    },
};

export default class Scheduler {
    //@ts-ignore
    constructor(private api: D2Api) {}

    private synchronizationTask = async (id: string): Promise<void> => {
        const rule = await SyncRule.get(this.api, id);
        //@ts-ignore
        const { name, frequency, builder, id: syncRule, type = "metadata" } = rule;
        //@ts-ignore
        const { SyncClass } = config[type];

        const logger = getLogger(name);
        try {
            const readableFrequency = cronstrue.toString(frequency || "");
            logger.debug(`Start ${type} rule with frequency: ${readableFrequency}`);
            /**const sync = new SyncClass(this.d2, this.api, { ...builder, syncRule });
            for await (const { message, syncReport, done } of sync.execute()) {
                if (message) logger.debug(message);
                if (syncReport) await syncReport.save(this.api);
                if (done && syncReport && syncReport.id) {
                    const reportUrl = this.buildUrl(type, syncReport.id);
                    logger.debug(`Finished. Report available at ${reportUrl}`);
                } else if (done) logger.warn(`Finished with errors`);
            }**/
            logger.error("Scheduler needs to be updated");
        } catch (error) {
            logger.error(`Failed executing rule`, error);
        }
    };

    private fetchTask = async (): Promise<void> => {
        const { objects: rules } = await SyncRule.list(this.api, {}, { paging: false });

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
                const nextDate = job.nextInvocation().toISOString();
                getLogger("scheduler").info(
                    `Scheduling new sync rule ${name} (${id}) at ${nextDate}`
                );
            }
        });
    };

    //@ts-ignore
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
