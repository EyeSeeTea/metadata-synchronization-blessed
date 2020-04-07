import { Dictionary } from "lodash";

export interface ModelDefinition {
    apiEndpoint: string;
    attributeProperties: any;
    displayName: string;
    identifiableObject: boolean;
    isMetaData: boolean;
    isShareable: boolean;
    javaClass: string;
    modelProperties: any;
    modelValidations: any;
    name: string;
    plural: string;
    translatable: boolean;

    list(params?: Params): ModelCollection;

    get(id: string, params?: Params): Promise<Model>;
}

export interface D2 {
    Api: {
        getApi(): D2Api;
    };
    models: {
        [metadataType: string]: ModelDefinition;
    };
    currentUser: {
        id: string;
        username: string;
        name: string;
        email: string;
        getUserRoles(): Promise<any>;
        getUserGroups(): Promise<any>;
        getOrganisationUnits(): Promise<any>;
    };
}

export interface Response {
    status: boolean;
    error?: Error;
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

export interface DataImportParams {
    idScheme?: "UID" | "CODE";
    dataElementIdScheme?: "UID" | "CODE" | "NAME";
    orgUnitIdScheme?: "UID" | "CODE" | "NAME";
    dryRun?: boolean;
    preheatCache?: boolean;
    skipExistingCheck?: boolean;
    strategy?: "NEW_AND_UPDATES" | "NEW" | "UPDATES" | "DELETES";
    format?: "json" | "xml" | "csv" | "pdf" | "adx";
}

export type ImportStatus = "PENDING" | "SUCCESS" | "WARNING" | "ERROR" | "NETWORK ERROR";
export type ResponseImportStatus =
    | "PENDING"
    | "OK"
    | "SUCCESS"
    | "WARNING"
    | "ERROR"
    | "NETWORK ERROR";

export interface MetadataImportResponse {
    status: ResponseImportStatus;
    importParams?: MetadataImportParams;
    typeReports?: any[];
    stats?: MetadataImportStats;
    message?: string;
}

export interface DataImportResponse {
    status: ResponseImportStatus;
    message?: string;
    dataSetComplete?: string;
    description?: string;
    importCount?: DataImportStats;
    importOptions?: DataImportParams;
    responseType?: "ImportSummary";
    conflicts?: {
        object: string;
        value: string;
    }[];
    response?: {
        responseType: "ImportSummaries";
        status: ResponseImportStatus;
        importOptions?: DataImportParams;
        importSummaries: {
            responseType?: "ImportSummary";
            status?: ResponseImportStatus;
            importOptions?: DataImportParams;
            description?: string;
            importCount?: DataImportStats;
            reference?: string;
            conflicts?: {
                object: string;
                value: string;
            }[];
        }[];
    };
}

export interface MetadataImportStats {
    created: number;
    deleted: number;
    ignored: number;
    updated: number;
    total: number;
}

export interface DataImportStats {
    imported: number;
    updated: number;
    ignored: number;
    deleted: number;
}
