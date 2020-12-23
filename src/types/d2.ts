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

    list(params?: any): any;

    get(id: string, params?: any): Promise<any>;
}

export interface D2 {
    Api: {
        getApi(): any;
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
    skipAudit?: boolean;
    strategy?: "NEW_AND_UPDATES" | "NEW" | "UPDATES" | "DELETES";
    format?: "json" | "xml" | "csv" | "pdf" | "adx";
}
