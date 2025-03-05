import moment from "moment";
import cronstrue from "cronstrue";
import { CompositionRoot } from "../presentation/CompositionRoot";
import { SchedulerContract } from "../domain/scheduler/entities/SchedulerContract";
import { DEFAULT_SCHEDULED_JOB_ID, ScheduledJob } from "../domain/scheduler/entities/ScheduledJob";
import { SyncRuleJobConfig } from "../domain/scheduler/entities/SyncRuleJobConfig";
import { SchedulerExecutionInfo } from "../domain/scheduler/entities/SchedulerExecutionInfo";
import { Logger } from "../domain/scheduler/entities/Logger";

/**
 * @description This file is refactored
 */
export class SchedulerCLI {
    constructor(
        private options: {
            scheduler: SchedulerContract;
            compositionRoot: CompositionRoot;
            logger: Logger;
        }
    ) {}

    public initialize(apiPath: string): void {
        this.fetchTask(apiPath);
        const { scheduler, logger } = this.options;

        scheduler.scheduleJob({ jobCallback: (): Promise<void> => this.fetchTask(apiPath) });

        logger.info("main", `Loading synchronization rules from remote server`);
    }

    private async fetchTask(apiPath: string): Promise<void> {
        const { scheduler, logger } = this.options;
        try {
            const syncRuleJobConfigs = await this.getSyncRuleJobConfigs();
            const jobIdsToBeScheduled = syncRuleJobConfigs.map(({ id }) => id);

            const scheduledJobs = scheduler.getScheduledJobs();
            const currentJobIdsScheduled = scheduledJobs.map(({ id }) => id);

            const jobIdsToCancel = currentJobIdsScheduled.filter(
                id => !jobIdsToBeScheduled.includes(id) && id !== DEFAULT_SCHEDULED_JOB_ID
            );
            if (jobIdsToCancel.length > 0) {
                this.cancelScheduledJobs(jobIdsToCancel, scheduledJobs);
            }

            const newSyncRuleJobConfigs = syncRuleJobConfigs.filter(({ id }) => !currentJobIdsScheduled.includes(id));
            if (newSyncRuleJobConfigs.length > 0) {
                this.createNewScheduledJobs(newSyncRuleJobConfigs, apiPath);
            }

            // TODO: update currentJobIdsScheduled if frequency has changed: first cancel job and then schedule it again

            this.updateNextExecutionOfScheduler(scheduledJobs);
        } catch (error) {
            const errorMessage = typeof error === "string" ? error : JSON.stringify(error, null, 2);
            logger.error("scheduler", `${errorMessage}`);
        }
    }

    private async synchronizationTask(ruleId: string, apiPath: string): Promise<void> {
        const { logger, compositionRoot } = this.options;

        const rule = await compositionRoot.rules.get(ruleId);

        if (!rule) return;

        const { name, frequency, builder, id: syncRule, type = "metadata" } = rule;

        try {
            const readableFrequency = cronstrue.toString(frequency || "");
            logger.debug(name, `Start ${type} rule with frequency: ${readableFrequency}`);
            const result = await compositionRoot.sync.prepare(type, builder);
            const sync = compositionRoot.sync[type]({ ...builder, syncRule });

            const synchronize = async () => {
                for await (const { message, syncReport, done } of sync.execute()) {
                    if (message) logger.debug(name, message);
                    if (syncReport) await compositionRoot.reports.save(syncReport);
                    if (done && syncReport && syncReport.id) {
                        const reportUrl = this.buildUrl(apiPath, type, syncReport.id);
                        logger.debug(name, `Finished. Report available at ${reportUrl}`);
                    } else if (done) logger.warn(name, `Finished with errors`);
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
                            logger.error(name, "Metadata has a custodian, unable to proceed with sync");
                            break;
                        case "INSTANCE_NOT_FOUND":
                            logger.error(name, "Couldn't connect with instance");
                            break;
                        case "NOT_AUTHORIZED":
                            logger.error(name, "User is not authorized to one or more instances");
                            break;
                        default:
                            logger.error(name, "Unknown synchronization error");
                    }
                },
            });
        } catch (error) {
            const errorMessage = typeof error === "string" ? error : JSON.stringify(error, null, 2);
            logger.error(name, `Failed executing rule: ${errorMessage}`);
        }
    }

    private async getSyncRuleJobConfigs(): Promise<SyncRuleJobConfig[]> {
        const { logger, compositionRoot } = this.options;

        const syncRuleJobConfigsToBeScheduled = await compositionRoot.scheduler.getSyncRuleJobConfigs().toPromise();

        logger.trace(
            "scheduler",
            `There are ${syncRuleJobConfigsToBeScheduled.length} valid sync rules marked to be scheduled`
        );

        return syncRuleJobConfigsToBeScheduled;
    }

    private cancelScheduledJobs(jobIdsToCancel: string[], scheduledJobs: ScheduledJob[]): void {
        const { scheduler, logger } = this.options;

        jobIdsToCancel.forEach((id: string) => {
            logger.info("scheduler", `Cancelling disabled rule with id ${id}`);
            const scheduledJobToCancel = scheduledJobs.find(scheduledJob => scheduledJob.id === id);
            if (scheduledJobToCancel) {
                scheduler.cancelJob(scheduledJobToCancel.id);
            }
        });
    }

    private createNewScheduledJobs(syncRuleJobConfig: SyncRuleJobConfig[], apiPath: string): void {
        syncRuleJobConfig.forEach((syncRuleJobConfig: SyncRuleJobConfig): void => {
            const { scheduler, logger } = this.options;

            const { id, name, frequency } = syncRuleJobConfig;

            if (id && frequency) {
                const job = scheduler.scheduleJob({
                    jobId: id,
                    frequency: frequency,
                    jobCallback: (): Promise<void> => this.synchronizationTask(id, apiPath),
                });

                // Format date to keep timezone offset
                const nextDate = moment(job.nextExecution.toISOString()).toISOString(true);
                logger.info("scheduler", `Scheduling new sync rule ${name} (${id}) at ${nextDate}`);
            }
        });
    }

    private async updateNextExecutionOfScheduler(scheduledJobs: ScheduledJob[]): Promise<void> {
        const { compositionRoot } = this.options;

        const defaultScheduledJob = scheduledJobs.find(scheduledJob => scheduledJob.id === DEFAULT_SCHEDULED_JOB_ID);
        const nextExecution = defaultScheduledJob?.nextExecution;
        const schedulerExecutionInfo = await compositionRoot.scheduler.getLastExecutionInfo().toPromise();

        const newSchedulerExecutionInfo: SchedulerExecutionInfo = {
            ...schedulerExecutionInfo,
            lastExecution: schedulerExecutionInfo.nextExecution,
            nextExecution: nextExecution,
        };

        await compositionRoot.scheduler.updateExecutionInfo(newSchedulerExecutionInfo).toPromise();
    }

    private buildUrl(apiPath: string, type: string, id: string): string {
        return `${apiPath}/apps/MetaData-Synchronization/index.html#/history/${type}/${id}`;
    }
}
