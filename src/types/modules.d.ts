declare module "d2" {
    import { D2 } from "./d2";

    export function init(config: { baseUrl: string; headers?: any }): D2;
}

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
