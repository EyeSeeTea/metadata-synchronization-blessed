import { ScheduledJob } from "./ScheduledJob";

export interface SchedulerContract {
    getScheduledJobs(): ScheduledJob[];
    scheduleJob(options: { jobId?: string; frequency?: string; jobCallback: () => Promise<void> }): ScheduledJob;
    cancelJob(id: string): void;
}
