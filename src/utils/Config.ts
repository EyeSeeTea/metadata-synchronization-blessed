import { Maybe } from "../types/utils";

class Config {
    get mode(): string {
        return process.env.MODE ?? process.env.NODE_ENV ?? "production";
    }

    get isDevelopment(): boolean {
        return this.mode === "development";
    }

    get presentationTitle(): Maybe<string> {
        return process.env.VITE_PRESENTATION_TITLE;
    }

    get presentationVariant(): Maybe<string> {
        return process.env.VITE_PRESENTATION_VARIANT;
    }

    get appPresentationVariant(): AppVariant {
        const DEFAULT = "core-app";
        const variant = this.presentationVariant;
        return this.isValidAppVariant(variant) ? variant : DEFAULT;
    }

    get presentationType(): PresentationType {
        const DEFAULT = "webapp";
        const type = process.env.VITE_PRESENTATION_TYPE;
        return this.isValidPresentationType(type) ? type : DEFAULT;
    }

    get isCypressEnabled(): boolean {
        return Boolean(process.env.VITE_CYPRESS);
    }

    private isValidAppVariant(variant: Maybe<string>): variant is AppVariant {
        return !!variant && (APP_VARIANTS as Readonly<string[]>).includes(variant);
    }

    private isValidPresentationType(type: Maybe<string>): type is PresentationType {
        return !!type && (PRESENTATION_TYPES as Readonly<string[]>).includes(type);
    }
}

const APP_VARIANTS = [
    "core-app",
    "data-metadata-app",
    "module-package-app",
    "msf-aggregate-data-app",
    "sp-emergency-responses",
    "wmr",
] as const;

export type AppVariant = typeof APP_VARIANTS[number];

const PRESENTATION_TYPES = ["webapp", "widget"] as const;

type PresentationType = typeof PRESENTATION_TYPES[number];

export const config = new Config();
