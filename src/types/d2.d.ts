import { Dictionary } from "lodash";

export interface DataStoreNamespace {
    delete(key: string): Promise<any>;
    get(key: string): Promise<any>;
    getKeys(): Promise<string[]>;
    set(key: string, value: any, overrideUpdate?: boolean, encrypt?: boolean): Promise<any>;
    update(key: string, value: any): Promise<any>;
}

export interface Params {
    paging?: boolean;
    page?: number;
    pageSize?: number;
    filter?: string[];
    fields?: string[];
    order?: string;
}

export interface D2Api {
    get(url: string, data: Params): Dictionary<any>;
    post(url: string, data: Dictionary<any>): Dictionary<any>;
    baseUrl: string;
}

export interface Pager {
    nextPage: string;
    prevPage: string;
    page: number;
    pageCount: number;
    total: number;
    query: Params;
    getNextPage(): Promise<ModelCollection>;
    getPreviousPage(): Promise<ModelCollection>;
    goToPage(): Promise<ModelCollection>;
    hasNextPage(): boolean;
    hasPreviousPage(): boolean;
}

export interface ModelCollection {
    modelDefinition: ModelDefinition;
    pager: Pager;
    size: number;
    add(model: Model): ModelCollection;
    clear(): ModelCollection;
    toArray(): Model[];
}

export interface ModelDefinition {
    list(params?: Params): ModelCollection;
    get(id: string, params?: Params): Promise<Model>;
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
}

export interface D2 {
    Api: {
        getApi(): D2Api;
    };
    dataStore: {
        get(namespace: string): Promise<DataStoreNamespace>;
        getAll(): Promise<DataStoreNamespace[]>;
        has(namespace: string): Promise<boolean>;
        create(namespace: string): Promise<DataStoreNamespace>;
        delete(namespace: string): Promise<any>;
    };
    models: {
        [metadataType: string]: ModelDefinition;
    };
    currentUser: {
        id: string;
        username: string;
        name: string;
        email: string;
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

export type MetadataImportStatus = "PENDING" | "OK" | "WARNING" | "ERROR" | "NETWORK ERROR";

export interface MetadataImportResponse {
    status: MetadataImportStatus;
    importParams?: MetadataImportParams;
    typeReports?: any[];
    stats?: MetadataImportStats;
}

export interface MetadataImportStats {
    created: number;
    deleted: number;
    ignored: number;
    updated: number;
    total: number;
}
