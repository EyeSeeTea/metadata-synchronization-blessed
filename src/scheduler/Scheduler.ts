import schedule from "node-schedule";
import { SchedulerContract } from "./SchedulerCLI/SchedulerContract";
import { DEFAULT_SCHEDULED_JOB_ID, ScheduledJob } from "../domain/scheduler/entities/ScheduledJob";
import { EVERY_MINUTE_FREQUENCY } from "./SchedulerCLI/SchedulerCLI";

/**
 * @description This file is refactored.
 */
export default class Scheduler implements SchedulerContract {
    public getScheduledJobs(): ScheduledJob[] {
        const jobs = schedule.scheduledJobs;
        const jobIds = Object.keys(jobs);

        return jobIds.map((jobId: keyof typeof jobs) => this.buildScheduledJob(jobs[jobId]));
    }

    public scheduleJob(options: {
        jobId?: string;
        frequency?: string;
        jobCallback: () => Promise<void>;
    }): ScheduledJob {
        const { jobId = DEFAULT_SCHEDULED_JOB_ID, frequency = EVERY_MINUTE_FREQUENCY, jobCallback } = options;

        const job = schedule.scheduleJob(jobId, frequency, jobCallback);

        return this.buildScheduledJob(job);
    }

    public cancelJob(id: string): void {
        schedule.scheduledJobs[id].cancel();
    }

    private buildScheduledJob(job: schedule.Job): ScheduledJob {
        return {
            id: job.name,
            nextExecution: job.nextInvocation(),
        };
    }
}
