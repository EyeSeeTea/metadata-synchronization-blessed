declare module "d2/uid" {
    export function generateUid(): string;
    export function isValidUid(uid: string): boolean;
}

declare module "@dhis2/d2-i18n" {
    export function t(value: string): string;
}

declare module "@dhis2/d2-i18n" {
    export function t(value: string, variable?: any): string;
}
