import moment from "moment";
import cronstrue from "cronstrue";
import { CompositionRoot } from "../presentation/CompositionRoot";
import { SchedulerContract } from "./entities/SchedulerContract";
import { DEFAULT_SCHEDULED_JOB_ID, ScheduledJob } from "./entities/ScheduledJob";
import { SyncRuleJobConfig } from "../domain/scheduler/entities/SyncRuleJobConfig";
import { SchedulerExecutionInfo } from "../domain/scheduler/entities/SchedulerExecutionInfo";
import { Logger } from "./entities/Logger";

export class SchedulerPresenter {
    constructor(
        private options: {
            scheduler: SchedulerContract;
            compositionRoot: CompositionRoot;
            logger: Logger;
        }
    ) {}

    public initialize(apiPath: string): void {
        this.fetchTask(apiPath);

        this.options.scheduler.scheduleJob({ jobCallback: (): Promise<void> => this.fetchTask(apiPath) });

        this.options.logger.info("main", `Loading synchronization rules from remote server`);
    }

    private async fetchTask(apiPath: string): Promise<void> {
        try {
            const syncRuleJobConfigs = await this.getSyncRuleJobConfigs();
            const jobIdsToBeScheduled = syncRuleJobConfigs.map(({ id }) => id);

            const scheduledJobs = this.options.scheduler.getScheduledJobs();
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
            this.options.logger.error("scheduler", `${errorMessage}`);
        }
    }

    private async synchronizationTask(ruleId: string, apiPath: string): Promise<void> {
        const rule = await this.options.compositionRoot.rules.get(ruleId);
        if (!rule) return;

        const { name, frequency, builder, id: syncRule, type = "metadata" } = rule;

        try {
            const readableFrequency = cronstrue.toString(frequency || "");
            this.options.logger.debug(name, `Start ${type} rule with frequency: ${readableFrequency}`);
            const result = await this.options.compositionRoot.sync.prepare(type, builder);
            const sync = this.options.compositionRoot.sync[type]({ ...builder, syncRule });

            const synchronize = async () => {
                for await (const { message, syncReport, done } of sync.execute()) {
                    if (message) this.options.logger.debug(name, message);
                    if (syncReport) await this.options.compositionRoot.reports.save(syncReport);
                    if (done && syncReport && syncReport.id) {
                        const reportUrl = this.buildUrl(apiPath, type, syncReport.id);
                        this.options.logger.debug(name, `Finished. Report available at ${reportUrl}`);
                    } else if (done) this.options.logger.warn(name, `Finished with errors`);
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
                            this.options.logger.error(name, "Metadata has a custodian, unable to proceed with sync");
                            break;
                        case "INSTANCE_NOT_FOUND":
                            this.options.logger.error(name, "Couldn't connect with instance");
                            break;
                        case "NOT_AUTHORIZED":
                            this.options.logger.error(name, "User is not authorized to one or more instances");
                            break;
                        default:
                            this.options.logger.error(name, "Unknown synchronization error");
                    }
                },
            });
        } catch (error) {
            const errorMessage = typeof error === "string" ? error : JSON.stringify(error, null, 2);
            this.options.logger.error(name, `Failed executing rule: ${errorMessage}`);
        }
    }

    private async getSyncRuleJobConfigs(): Promise<SyncRuleJobConfig[]> {
        const syncRuleJobConfigsToBeScheduled = await this.options.compositionRoot.scheduler.getSyncRuleJobConfigs();

        this.options.logger.trace(
            "scheduler",
            `There are ${syncRuleJobConfigsToBeScheduled.length} valid sync rules marked to be scheduled`
        );

        return syncRuleJobConfigsToBeScheduled;
    }

    private cancelScheduledJobs(jobIdsToCancel: string[], scheduledJobs: ScheduledJob[]): void {
        jobIdsToCancel.forEach((id: string) => {
            this.options.logger.info("scheduler", `Cancelling disabled rule with id ${id}`);
            const scheduledJobToCancel = scheduledJobs.find(scheduledJob => scheduledJob.id === id);
            if (scheduledJobToCancel) {
                this.options.scheduler.cancelJob(scheduledJobToCancel.id);
            }
        });
    }

    private createNewScheduledJobs(syncRuleJobConfig: SyncRuleJobConfig[], apiPath: string): void {
        syncRuleJobConfig.forEach((syncRuleJobConfig: SyncRuleJobConfig): void => {
            const { id, name, frequency } = syncRuleJobConfig;

            if (id && frequency) {
                const job = this.options.scheduler.scheduleJob({
                    jobId: id,
                    frequency: frequency,
                    jobCallback: (): Promise<void> => this.synchronizationTask(id, apiPath),
                });

                // Format date to keep timezone offset
                const nextDate = moment(job.nextExecution.toISOString()).toISOString(true);
                this.options.logger.info("scheduler", `Scheduling new sync rule ${name} (${id}) at ${nextDate}`);
            }
        });
    }

    private async updateNextExecutionOfScheduler(scheduledJobs: ScheduledJob[]): Promise<void> {
        const defaultScheduledJob = scheduledJobs.find(scheduledJob => scheduledJob.id === DEFAULT_SCHEDULED_JOB_ID);
        const nextExecution = defaultScheduledJob?.nextExecution;
        const schedulerExecutionInfo = await this.options.compositionRoot.scheduler.getLastExecutionInfo();

        const newSchedulerExecutionInfo: SchedulerExecutionInfo = {
            ...schedulerExecutionInfo,
            lastExecution: schedulerExecutionInfo.nextExecution,
            nextExecution: nextExecution,
        };

        await this.options.compositionRoot.scheduler.updateExecutionInfo(newSchedulerExecutionInfo);
    }

    private buildUrl(apiPath: string, type: string, id: string): string {
        return `${apiPath}/apps/MetaData-Synchronization/index.html#/history/${type}/${id}`;
    }
}
