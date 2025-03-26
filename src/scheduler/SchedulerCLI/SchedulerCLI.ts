import moment from "moment";
import cronstrue from "cronstrue";
import { CompositionRoot } from "../../presentation/CompositionRoot";
import { SchedulerContract } from "./SchedulerContract";
import { DEFAULT_SCHEDULED_JOB_ID, ScheduledJob } from "../../domain/scheduler/entities/ScheduledJob";
import { SchedulerExecutionInfo } from "../../domain/scheduler/entities/SchedulerExecutionInfo";
import { Logger } from "./Logger";
import { SynchronizationRule } from "../../domain/rules/entities/SynchronizationRule";

// NOTICE: This is refactored

export type SyncRuleJobConfig = {
    id: string;
    name: string;
    frequency: string;
    needsUpdateFrequency: boolean;
};

export const EVERY_MINUTE_FREQUENCY = "0 * * * * *";

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
            const syncRulesWithSchedulerEnabled = await this.getEnabledSyncRules();
            const syncRuleJobConfigs = await this.getSyncRuleJobConfigs(syncRulesWithSchedulerEnabled);
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

            const currentJobConfigsScheduledThatHasChange: SyncRuleJobConfig[] = syncRuleJobConfigs
                .filter(({ id }) => currentJobIdsScheduled.includes(id))
                .filter(({ id, needsUpdateFrequency }) => {
                    if (needsUpdateFrequency) {
                        logger.info("scheduler", `Frequency has changed for rule with id ${id}`);
                        return true;
                    }
                    return false;
                });

            if (currentJobConfigsScheduledThatHasChange.length > 0) {
                this.updateCurrentScheduledJobs({
                    syncRuleJobConfig: currentJobConfigsScheduledThatHasChange,
                    scheduledJobs,
                    apiPath,
                });
                const jobIdsToUpdate = currentJobConfigsScheduledThatHasChange.map(({ id }) => id);
                const syncRulesToUpdate = syncRulesWithSchedulerEnabled.filter(syncRule =>
                    jobIdsToUpdate.includes(syncRule.id)
                );
                this.disableNeedsUpdateSchedulingFrequencyInSyncRules(syncRulesToUpdate);
            }

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

    private async getEnabledSyncRules(): Promise<SynchronizationRule[]> {
        const { compositionRoot } = this.options;

        const { rows: rulesWithSchedulerEnabled } = await compositionRoot.rules.list({
            paging: false,
            filters: { schedulerEnabledFilter: "enabled" },
        });

        return rulesWithSchedulerEnabled;
    }

    private async getSyncRuleJobConfigs(
        rulesWithSchedulerEnabled: SynchronizationRule[]
    ): Promise<SyncRuleJobConfig[]> {
        const { logger } = this.options;

        const syncRuleJobConfigsToBeScheduled =
            this.mapSynchronizationRulesToSyncRuleJobConfigs(rulesWithSchedulerEnabled);

        logger.trace(
            "scheduler",
            `There are ${syncRuleJobConfigsToBeScheduled.length} valid sync rules marked to be scheduled`
        );

        return syncRuleJobConfigsToBeScheduled;
    }

    private mapSynchronizationRulesToSyncRuleJobConfigs(syncRule: SynchronizationRule[]): SyncRuleJobConfig[] {
        return syncRule.reduce((acc: SyncRuleJobConfig[], syncRule: SynchronizationRule): SyncRuleJobConfig[] => {
            if (syncRule.frequency) {
                const syncRuleJobConfig: SyncRuleJobConfig = {
                    id: syncRule.id,
                    name: syncRule.name,
                    frequency: syncRule.frequency,
                    needsUpdateFrequency: syncRule.schedulingFrequencyNeedsUpdate,
                };
                return [...acc, syncRuleJobConfig];
            } else {
                return acc;
            }
        }, []);
    }

    private cancelScheduledJobs(jobIdsToCancel: string[], scheduledJobs: ScheduledJob[]): void {
        const { scheduler, logger } = this.options;

        jobIdsToCancel.forEach((id: string) => {
            logger.info("scheduler", `Cancelling rule with id ${id}`);
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
                logger.info("scheduler", `Scheduling sync rule ${name} (${id}) at ${nextDate}`);
            }
        });
    }

    private updateCurrentScheduledJobs(params: {
        syncRuleJobConfig: SyncRuleJobConfig[];
        scheduledJobs: ScheduledJob[];
        apiPath: string;
    }): void {
        const { logger } = this.options;
        const { syncRuleJobConfig, scheduledJobs, apiPath } = params;

        const jobIdsToCancel = syncRuleJobConfig.map(({ id }) => id);
        logger.info("scheduler", `Updating frequency for rules with ids ${jobIdsToCancel.join(", ")}`);

        this.cancelScheduledJobs(jobIdsToCancel, scheduledJobs);
        this.createNewScheduledJobs(syncRuleJobConfig, apiPath);
    }

    private async disableNeedsUpdateSchedulingFrequencyInSyncRules(syncRulesToUpdate: SynchronizationRule[]) {
        const { logger, compositionRoot } = this.options;

        const updatedSyncRules = syncRulesToUpdate.map(syncRule =>
            syncRule.updateNeedsUpdateSchedulingFrequency(false)
        );
        await compositionRoot.rules.save(updatedSyncRules);
        logger.info(
            "scheduler",
            `Disabled schedulingFrequencyNeedsUpdate for rules with ids ${syncRulesToUpdate
                .map(({ id }) => id)
                .join(", ")}`
        );
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
