// Represents a git repository that stores modules
export interface Store {
    token: string;
    account: string;
    repository: string;
    branch?: string;
    basePath?: string;
}
