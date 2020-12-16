import { D2Api } from "../types/d2-api";

export interface Config {
    version: number;
    migration?: { version: number; error?: string };
}

export type Debug = (message: string) => void;

export interface MigrationWithVersion {
    version: number;
    migrate: MigrationFn;
    name: string;
}

export type Migration = Omit<MigrationWithVersion, "version">;

export type MigrationFn = (api: D2Api, debug: Debug) => Promise<void>;

export interface RunnerOptions {
    api: D2Api;
    debug?: Debug;
    dataStoreNamespace: string;
    migrations: MigrationWithVersion[];
}

export type MigrationTasks = MigrationWithVersion[];

export function migration(version: number, migration: Migration): MigrationWithVersion {
    return { version, ...migration };
}
