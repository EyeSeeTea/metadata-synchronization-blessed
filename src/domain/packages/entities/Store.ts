export interface Store {
    id: string;
    token: string;
    account: string;
    repository: string;
    default: boolean;
    branch?: string;
    basePath?: string;
}
