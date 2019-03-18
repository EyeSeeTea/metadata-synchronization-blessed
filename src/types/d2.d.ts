import { Dictionary } from "lodash";

export interface DataStoreNamespace {
    delete(key: string): Promise<>;
    get(key: string): Promise<any>;
    getKeys(): Promise<string[]>;
    set(key: string, value: any, overrideUpdate?: boolean, encrypt?: boolean): Promise<>;
    update(key: string, value: any): Promise<>;
}

export interface Params {
    paging?: boolean;
    pageSize?: number;
    filter?: string[];
    fields?: string[];
    order?: string;
}

export interface D2Api {
    get(url: string, data: Params): Dictionary<any>;
    post(url: string, data: Dictionary<any>): Dictionary<any>;
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
        delete(namespace: string): Promise<>;
    };
    models: {
        [metadataType: string]: ModelDefinition;
    };
}

export interface Response {
    status: boolean;
    error?: Error;
}
