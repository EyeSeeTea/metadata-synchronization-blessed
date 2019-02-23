export interface DataStoreNamespace {
    delete(key: string): Promise<>;
    get(key: string): Promise<string>;
    getKeys(): Promise<string[]>;
    set(key: string, value: string, overrideUpdate?: boolean, encrypt?: boolean): Promise<>;
    update(key: string, value: string): Promise<>;
}

export interface D2 {
    dataStore: {
        get(namespace: string): Promise<DataStoreNamespace>;
        getAll(): Promise<DataStoreNamespace[]>;
        has(namespace: string): Promise<boolean>;
        create(namespace: string): Promise<DataStoreNamespace>;
        delete(namespace: string): Promise<>;
    };
}