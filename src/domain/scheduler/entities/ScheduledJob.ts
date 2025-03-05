// NOTICE: This is refactored

export type ScheduledJob = {
    id: string;
    nextExecution: Date;
};

export const DEFAULT_SCHEDULED_JOB_ID = "__default__";
