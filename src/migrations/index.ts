import { D2Api } from "d2-api";
import _ from "lodash";
import {
    dataStoreNamespace,
    deleteDataStore,
    getDataStore,
    saveDataStore,
} from "../models/dataStore";
import { Config, Debug, Migration, RunnerOptions } from "../types/migrations";
import { promiseMap } from "../utils/common";
import { getMigrationsForWebpack } from "./utils";

export class MigrationsRunner {
    public migrations: Migration[];
    public debug: Debug;
    public appVersion: number;
    private backupPrefix = "backup-";

    constructor(private api: D2Api, private config: Config, private options: RunnerOptions) {
        const { debug = _.identity, migrations = getMigrationsForWebpack() } = options;
        this.appVersion = _.max(migrations.map(info => info.version)) || 0;
        this.debug = debug;
        this.migrations = this.getMigrationToApply(migrations, config);
    }

    setDebug(debug: Debug) {
        const newOptions = { ...this.options, debug };
        return new MigrationsRunner(this.api, this.config, newOptions);
    }

    static async init(options: RunnerOptions): Promise<MigrationsRunner> {
        const { api } = options;
        const config = await getDataStore<Config>(api, "config", { version: 0 });
        return new MigrationsRunner(api, config, options);
    }

    public async execute(): Promise<void> {
        // Re-load the runner to make sure we have the latest data as config.
        const runner = await MigrationsRunner.init(this.options);
        return runner.migrateFromCurrent();
    }

    public async migrateFromCurrent(): Promise<void> {
        const { config, migrations, debug } = this;

        if (_.isEmpty(migrations)) {
            debug(`No migrations pending to run (current version: ${config.version})`);
            return;
        }

        debug(`Migrate: v${this.instanceVersion} -> v${this.appVersion}`);

        await this.rollBackExistingBackup();
        await this.backupDataStore();

        try {
            await this.runMigrations(migrations);
        } catch (error) {
            await this.rollbackDataStore(error);
            throw error;
        }

        await this.deleteBackup();
    }

    async runMigrations(migrations: Migration[]): Promise<Config> {
        const { api, debug, config } = this;

        const configWithCurrentMigration: Config = {
            ...config,
            migration: { version: this.appVersion },
        };
        await saveDataStore(api, "config", configWithCurrentMigration);

        for (const migration of migrations) {
            debug(`Apply migration ${migration.version}: ${migration.name}`);
            await migration.fn(api, debug);
        }

        const newConfig = { version: this.appVersion };
        await saveDataStore(api, "config", newConfig);
        return newConfig;
    }

    async deleteBackup() {
        try {
            const { debug, api } = this;
            const backupKeys = await this.getBackupKeys();
            debug(`Delete backup entries`);

            await promiseMap(backupKeys, async backupKey => {
                await deleteDataStore(api, backupKey);
            });
        } catch (err) {
            this.debug(`Error deleting backup (non-fatal)`);
        }
    }

    async rollBackExistingBackup() {
        if (this.config.migration) {
            await this.rollbackDataStore(new Error("Rollback existing backup"));
        }
    }

    async backupDataStore() {
        const { api, debug } = this;
        debug(`Backup data store`);
        const allKeys = await this.getDataStoreKeys();
        const keysToBackup = _(allKeys)
            .reject(key => key.startsWith(this.backupPrefix))
            .difference(["config"])
            .compact()
            .value();

        await promiseMap(keysToBackup, async key => {
            const value = await getDataStore(api, key, {});
            const backupKey = this.backupPrefix + key;
            await saveDataStore(api, backupKey, value);
        });
    }

    async getDataStoreKeys(): Promise<string[]> {
        return this.api
            .dataStore(dataStoreNamespace)
            .getKeys()
            .getData();
    }

    async getBackupKeys() {
        const allKeys = await this.getDataStoreKeys();
        return allKeys.filter(key => key.startsWith(this.backupPrefix));
    }

    async rollbackDataStore(error: Error): Promise<Config> {
        const { api, debug, config } = this;
        const errorMsg = error.message || error.toString();
        const keysToRestore = await this.getBackupKeys();

        if (_.isEmpty(keysToRestore)) return config;

        debug(`Error: ${errorMsg}`);
        debug("Start rollback");

        await promiseMap(keysToRestore, async backupKey => {
            const value = await getDataStore(api, backupKey, {});
            const key = backupKey.replace(/^backup-/, "");
            await saveDataStore(api, key, value);
            await deleteDataStore(api, backupKey);
        });

        const configWithCurrentMigration: Config = {
            ...this.config,
            migration: { version: this.appVersion, error: errorMsg },
        };
        await saveDataStore(api, "config", configWithCurrentMigration);
        return configWithCurrentMigration;
    }

    getMigrationToApply(allMigrations: Migration[], config: Config) {
        return _(allMigrations)
            .filter(info => info.version > config.version)
            .sortBy(info => info.version)
            .value();
    }

    hasPendingMigrations(): boolean {
        return this.config.version !== this.appVersion;
    }

    get instanceVersion(): number {
        return this.config.version;
    }
}
