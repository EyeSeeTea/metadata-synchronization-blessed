import { ProgramEventDataValue } from "./ProgramEventDataValue";
export interface ProgramEvent {
    id: string;
    orgUnit: string;
    orgUnitName?: string;
    program: string;
    programStage?: string;
    createdAt?: string;
    deleted?: boolean;
    updatedAt?: string;
    status: EventStatus;
    storedBy?: string;
    scheduledAt?: string;
    occurredAt: string;
    attributeCategoryOptions?: string;
    attributeOptionCombo?: string;
    dataValues: ProgramEventDataValue[];
    event?: string;
}

export type EventStatus = "ACTIVE" | "COMPLETED" | "VISITED" | "SCHEDULE" | "OVERDUE" | "SKIPPED";
