import { D2Api } from "d2-api";

export interface Config {
    version: number;
    migration?: { version: number; error?: string };
}

export type Debug = (message: string) => void;

export type Migration = { version: number; fn: MigrationFn; name: string };

export type MigrationFn = (api: D2Api, debug: Debug) => Promise<void>;

export interface RunnerOptions {
    api: D2Api;
    debug?: Debug;
    migrations?: Migration[];
}
