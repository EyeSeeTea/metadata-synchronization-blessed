export interface MetadataImportResponse {
    status: ResponseImportStatus;
    importParams?: MetadataImportParams;
    typeReports?: any[];
    stats?: MetadataImportStats;
    message?: string;
}

export type ResponseImportStatus =
    | "PENDING"
    | "OK"
    | "SUCCESS"
    | "WARNING"
    | "ERROR"
    | "NETWORK ERROR";

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

export interface MetadataImportStats {
    created: number;
    deleted: number;
    ignored: number;
    updated: number;
    total: number;
}