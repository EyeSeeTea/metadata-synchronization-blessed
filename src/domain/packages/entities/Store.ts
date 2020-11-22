export interface Store {
    id: string;
    token: string;
    account: string;
    repository: string;
    branch?: string;
    basePath?: string;
    default: boolean;
    deleted?: boolean;
}
