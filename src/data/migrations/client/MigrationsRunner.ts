import _ from "lodash";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Config, MigrationWithVersion, RunnerOptions } from "./types";
import { zeroPad } from "./utils";

export class MigrationsRunner<T> {
    public migrations: MigrationWithVersion<T>[];
    public debug: Debug;
    public appVersion: number;
    private backupPrefix: string;
    private storage: AppStorage;
    private storageKey: string;
    private migrationParams: T;

    constructor(private config: Config, private options: RunnerOptions<T>) {
        this.appVersion = getMaxMigrationVersion(options.migrations);
        this.migrations = this.getMigrationsToApply(options.migrations, config);
        this.storage = options.storage;
        this.storageKey = options.storageKey ?? "config";
        this.backupPrefix = options.backupPrefix ?? "backup-";
        this.debug = options.debug ?? _.identity;
        this.migrationParams = options.migrationParams;
    }

    setDebug(debug: Debug): MigrationsRunner<T> {
        const newOptions = { ...this.options, debug };
        return new MigrationsRunner(this.config, newOptions);
    }

    static async init<T>(options: RunnerOptions<T>): Promise<MigrationsRunner<T>> {
        const { migrations, storage, storageKey = "config" } = options;

        const storageKeys = await storage.listKeys();
        const freshInstall = storageKeys.length === 0;

        const version = freshInstall ? getMaxMigrationVersion(migrations) : 0;
        const config = await storage.getOrCreate<Config>(storageKey, { version });

        return new MigrationsRunner(config, options);
    }

    public hasPendingMigrations(): boolean {
        return this.config.version !== this.appVersion;
    }

    public get instanceVersion(): number {
        return this.config.version;
    }

    public async execute(): Promise<void> {
        // Re-load the runner to make sure we have the latest data as config.
        const runner = await MigrationsRunner.init(this.options);
        return runner.migrateFromCurrent();
    }

    private async migrateFromCurrent(): Promise<void> {
        const { config, migrations, debug } = this;

        if (_.isEmpty(migrations)) {
            debug({ message: `No migrations pending to run (current version: ${config.version})` });
            return;
        }

        debug({
            message: `Migrate: version ${this.instanceVersion} to version ${this.appVersion}`,
        });

        await this.runMigrations(migrations);
    }

    private async runMigrations(migrations: MigrationWithVersion<T>[]): Promise<Config> {
        const { storage, debug, config, migrationParams } = this;

        // Save migration state in storage
        await storage.save(this.storageKey, {
            ...config,
            migration: { version: this.appVersion },
        });

        await promiseMap(migrations, async migration => {
            debug({
                message: `Apply migration ${zeroPad(migration.version, 2)} - ${migration.name}`,
            });
            try {
                await migration.migrate(storage, debug, migrationParams);
            } catch (error: any) {
                const errorMsg = `${migration.name}: ${error.message}`;
                await this.saveConfig({ errorMsg });
                throw error;
            }
        });

        // Save success state in storage
        const newConfig = { version: this.appVersion };
        await storage.save(this.storageKey, newConfig);
        return newConfig;
    }

    // dataStore backup methods are currently unused, call only if a migration needs it.

    public async deleteBackup() {
        try {
            const { storage, debug } = this;
            const backupKeys = await this.getBackupKeys();
            debug({ message: `Delete backup entries` });

            await promiseMap(backupKeys, backupKey => storage.remove(backupKey));
        } catch (err: any) {
            this.debug({ message: `Error deleting backup (non-fatal)` });
        }
    }

    public async rollBackExistingBackup() {
        if (this.config.migration) {
            await this.rollbackDataStore(new Error("Rollback existing backup"));
        }
    }

    public async backupDataStore() {
        const { storage, storageKey, debug } = this;
        debug({ message: `Backup data store` });
        const allKeys = await this.getStorageKeys();
        const keysToBackup = _(allKeys)
            .reject(key => key.startsWith(this.backupPrefix))
            .difference([storageKey])
            .compact()
            .value();

        await promiseMap(keysToBackup, async key => {
            const value = await storage.get(key);
            if (!value) return;

            const backupKey = this.backupPrefix + key;
            await storage.save(backupKey, value);
        });
    }

    private async getStorageKeys(): Promise<string[]> {
        return this.storage.listKeys();
    }

    private async getBackupKeys() {
        const allKeys = await this.getStorageKeys();
        return allKeys.filter(key => key.startsWith(this.backupPrefix));
    }

    private async rollbackDataStore(error: Error): Promise<Config> {
        const { debug, config, storage } = this;
        const errorMsg = error.message || error.toString();
        const keysToRestore = await this.getBackupKeys();

        if (_.isEmpty(keysToRestore)) return config;

        debug({ message: `Error: ${errorMsg}` });
        debug({ message: "Start rollback" });

        await promiseMap(keysToRestore, async backupKey => {
            const value = await storage.get(backupKey);
            if (!value) return;

            const key = backupKey.replace(/^backup-/, "");
            await storage.save(key, value);
            await storage.remove(backupKey);
        });

        return this.saveConfig({ errorMsg });
    }

    private async saveConfig(options: { errorMsg?: string } = {}) {
        const { errorMsg } = options;
        const newConfig: Config = {
            ...this.config,
            migration: { version: this.appVersion, error: errorMsg },
        };

        await this.storage.save(this.storageKey, newConfig);
        return newConfig;
    }

    private getMigrationsToApply(allMigrations: MigrationWithVersion<T>[], config: Config) {
        return _(allMigrations)
            .filter(info => info.version > config.version)
            .sortBy(info => info.version)
            .value();
    }
}

function getMaxMigrationVersion<T>(migrations: MigrationWithVersion<T>[]): number {
    return _.max(migrations.map(info => info.version)) || 0;
}
