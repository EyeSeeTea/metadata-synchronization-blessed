export interface Enrollment {
    enrollment: string;
    createdAt: string;
    createdAtClient: string;
    updatedAt: string;
    updatedAtClient: string;
    trackedEntity?: string;
    trackedEntityType?: string;
    program: string;
    status: "ACTIVE" | "COMPLETED" | "CANCELLED";
    orgUnit: string;
    orgUnitName: string;
    enrolledAt: string;
    occurredAt: string;
    followUp: boolean;
    deleted: boolean;
    storedBy: string;
    notes: string[];
}
