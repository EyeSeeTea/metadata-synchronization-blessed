import { Debug } from "../../../domain/migrations/entities/Debug";

export interface MigrationWithVersion<T> {
    version: number;
    migrate: MigrationFn<T>;
    name: string;
}

export type Migration<T> = Omit<MigrationWithVersion<T>, "version">;

export type MigrationFn<T> = (storage: AppStorage, debug: Debug, params: T) => Promise<void>;

export interface Config {
    version: number;
    migration?: { version: number; error?: string };
}

export interface AppStorage {
    get<T extends object>(key: string): Promise<T | undefined>;
    getOrCreate<T extends object>(key: string, defaultValue: T): Promise<T>;
    save<T extends object>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
    listKeys(): Promise<string[]>;
}

export interface RunnerOptions<T> {
    storage: AppStorage;
    storageKey?: string;
    migrations: MigrationWithVersion<T>[];
    debug?: Debug;
    backupPrefix?: string;
    migrationParams: T;
}

export type MigrationTasks<T> = Array<[number, Promise<{ default: Migration<T> }>]>;
