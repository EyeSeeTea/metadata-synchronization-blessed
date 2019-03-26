declare module "d2/uid" {
    export function generateUid(): string;
}

declare module "@dhis2/d2-i18n" {
    export function t(value: string, variable?: any): string;
}
