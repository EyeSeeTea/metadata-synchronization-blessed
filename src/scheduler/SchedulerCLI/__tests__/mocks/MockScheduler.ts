import { ScheduledJob, DEFAULT_SCHEDULED_JOB_ID } from "../../../../domain/scheduler/entities/ScheduledJob";
import { SchedulerContract } from "../../SchedulerContract";

export class MockScheduler implements SchedulerContract {
    private jobs: ScheduledJob[] = [];

    getScheduledJobs(): ScheduledJob[] {
        return this.jobs;
    }

    scheduleJob(options: { jobId?: string; frequency?: string; jobCallback: () => Promise<void> }): ScheduledJob {
        const { jobId = DEFAULT_SCHEDULED_JOB_ID } = options;

        const job: ScheduledJob = {
            id: jobId,
            nextExecution: new Date(),
        };

        this.jobs = [...this.jobs, job];
        return job;
    }

    cancelJob(id: string): void {
        this.jobs = this.jobs.filter(job => job.id !== id);
    }
}
