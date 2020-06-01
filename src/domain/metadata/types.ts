export interface MetadataImportResponse {
    status: "PENDING" | "OK" | "SUCCESS" | "WARNING" | "ERROR" | "NETWORK ERROR";
    typeReports?: any[];
    stats?: {
        created: number;
        deleted: number;
        ignored: number;
        updated: number;
        total: number;
    };
    message?: string;
}

export interface MetadataImportParams {
    atomicMode?: "ALL" | "NONE";
    flushMode?: "AUTO" | "OBJECT";
    identifier?: "UID" | "CODE" | "AUTO";
    importMode?: "COMMIT" | "VALIDATE";
    importStrategy?: "CREATE_AND_UPDATE" | "CREATE" | "UPDATE" | "DELETE";
    importReportMode?: "ERRORS" | "FULL" | "DEBUG";
    mergeMode?: "MERGE" | "REPLACE";
    preheatMode?: "REFERENCE" | "ALL" | "NONE";
    skipSharing?: boolean;
    skipValidation?: boolean;
    userOverrideMode?: "NONE" | "CURRENT" | "SELECTED";
    username?: string;
}
