export interface Enrollment {
    storedBy: string;
    createdAtClient: string;
    program: string;
    lastUpdated: string;
    created: string;
    orgUnit: string;
    trackedEntityInstance: string;
    enrollment: string;
    trackedEntityType: string;
    lastUpdatedAtClient: string;
    orgUnitName: string;
    enrollmentDate: string;
    deleted: Boolean;
    incidentDate: string;
    status: "ACTIVE" | "COMPLETED" | "CANCELED";
    notes: String[];
}
