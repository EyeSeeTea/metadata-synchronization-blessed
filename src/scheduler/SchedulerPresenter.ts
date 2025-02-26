import { CompositionRoot } from "../presentation/CompositionRoot";
import { SchedulerContract } from "./entities/SchedulerContract";
import { getLogger } from "log4js";
import cronstrue from "cronstrue";
import moment from "moment";
import { DEFAULT_SCHEDULED_JOB_ID, ScheduledJob } from "./entities/ScheduledJob";
import { SyncRuleJobConfig } from "../domain/scheduler/entities/SyncRuleJobConfig";
import { SchedulerExecutionInfo } from "../domain/scheduler/entities/SchedulerExecutionInfo";

export class SchedulerPresenter {
    constructor(private schedulerContract: SchedulerContract, private compositionRoot: CompositionRoot) {}

    public initialize(apiPath: string): void {
        this.fetchTask(apiPath);

        this.schedulerContract.scheduleJob({ jobCallback: (): Promise<void> => this.fetchTask(apiPath) });

        getLogger("main").info(`Loading synchronization rules from remote server`);
    }

    private async fetchTask(apiPath: string): Promise<void> {
        try {
            const syncRuleJobConfigs = await this.getSyncRuleJobConfigs();
            const jobIdsToBeScheduled = syncRuleJobConfigs.map(({ id }) => id);

            const scheduledJobs = this.schedulerContract.getScheduledJobs();
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

    private async getSyncRuleJobConfigs(): Promise<SyncRuleJobConfig[]> {
        const syncRuleJobConfigsToBeScheduled = await this.compositionRoot.scheduler.getSyncRuleJobConfigs();

        getLogger("scheduler").trace(
            `There are ${syncRuleJobConfigsToBeScheduled.length} valid sync rules marked to be scheduled`
        );

        return syncRuleJobConfigsToBeScheduled;
    }

    private cancelScheduledJobs(jobIdsToCancel: string[], scheduledJobs: ScheduledJob[]): void {
        jobIdsToCancel.forEach((id: string) => {
            getLogger("scheduler").info(`Cancelling disabled rule with id ${id}`);
            const scheduledJobToCancel = scheduledJobs.find(scheduledJob => scheduledJob.id === id);
            if (scheduledJobToCancel) {
                this.schedulerContract.cancelJob(scheduledJobToCancel.id);
            }
        });
    }

    private createNewScheduledJobs(syncRuleJobConfig: SyncRuleJobConfig[], apiPath: string): void {
        syncRuleJobConfig.forEach((syncRuleJobConfig: SyncRuleJobConfig): void => {
            const { id, name, frequency } = syncRuleJobConfig;

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
    }

    private async updateNextExecutionOfScheduler(scheduledJobs: ScheduledJob[]): Promise<void> {
        const defaultScheduledJob = scheduledJobs.find(scheduledJob => scheduledJob.id === DEFAULT_SCHEDULED_JOB_ID);
        const nextExecution = defaultScheduledJob?.nextExecution;
        const schedulerExecutionInfo = await this.compositionRoot.scheduler.getLastExecutionInfo();

        const newSchedulerExecutionInfo: SchedulerExecutionInfo = {
            ...schedulerExecutionInfo,
            lastExecution: schedulerExecutionInfo.nextExecution,
            nextExecution: nextExecution,
        };

        await this.compositionRoot.scheduler.updateExecutionInfo(newSchedulerExecutionInfo);
    }

    private buildUrl(apiPath: string, type: string, id: string): string {
        return `${apiPath}/apps/MetaData-Synchronization/index.html#/history/${type}/${id}`;
    }
}
