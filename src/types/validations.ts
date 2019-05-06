export interface ValidationItem {
    key: string;
    namespace: object;
}

export interface Validation {
    [key: string]: ValidationItem[];
}
