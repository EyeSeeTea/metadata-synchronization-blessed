import { D2Api, D2ApiDefault } from "d2-api";
import _ from "lodash";

import { RunnerOptions, Config, Debug, Migration } from "../types/migrations";
import { promiseMap } from "./utils";
import { dataStoreNamespace } from "../models/dataStore";
import { getDataStore, saveDataStore, deleteDataStore } from "../models/dataStore";

import instancesById from "./tasks/01.instances-by-id";
import rulesById from "./tasks/02.rules-by-id";

const migrations: Migration[] = [
    { version: 1, fn: instancesById, name: "Create instances-ID" },
    { version: 2, fn: rulesById, name: "Create rules-ID" },
];

const appVersion = _.max(migrations.map(info => info.version)) || 0;

export class MigrationsRunner {
    migrations: Migration[];
    debug: Debug;

    backupPrefix = "backup-";

    constructor(private api: D2Api, private config: Config, private options: RunnerOptions) {
        const { debug = _.identity } = options;
        this.migrations = migrations;
        this.debug = debug;
        this.migrations = this.getMigrationToApply(config);
    }

    setDebug(debug: Debug) {
        const newOptions = { ...this.options, debug };
        return new MigrationsRunner(this.api, this.config, newOptions);
    }

    static async init(options: RunnerOptions): Promise<MigrationsRunner> {
        const { baseUrl } = options;
        const api = new D2ApiDefault({ baseUrl: baseUrl });
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

        if (!this.hasPendingMigrations()) {
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

        try {
            await this.deleteBackup();
        } catch (err) {
            debug(`Error deleting backup (non-fatal)`);
        }
    }

    async runMigrations(migrations: Migration[]): Promise<Config> {
        const { api, debug, config } = this;

        const configWithCurrentMigration: Config = {
            ...config,
            migration: { version: appVersion },
        };
        await saveDataStore(api, "config", configWithCurrentMigration);

        for (const migration of migrations) {
            debug(`Apply migration ${migration.version}: ${migration.name}`);
            await migration.fn(api, debug);
        }

        const newConfig = { version: appVersion };
        await saveDataStore(api, "config", newConfig);
        return newConfig;
    }

    async deleteBackup() {
        const { debug, api } = this;
        const backupKeys = await this.getBackupKeys();
        debug(`Delete backup entries`);

        await promiseMap(backupKeys, async backupKey => {
            await deleteDataStore(api, backupKey);
        });
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
            migration: { version: appVersion, error: errorMsg },
        };
        await saveDataStore(api, "config", configWithCurrentMigration);
        return configWithCurrentMigration;
    }

    getMigrationToApply(config: Config) {
        return _(this.migrations)
            .filter(info => info.version > config.version)
            .sortBy(info => info.version)
            .value();
    }

    hasPendingMigrations(): boolean {
        return this.config.version !== appVersion;
    }

    get instanceVersion(): number {
        return this.config.version;
    }

    get appVersion(): number {
        return appVersion;
    }
}

async function main() {
    const [baseUrl] = process.argv.slice(2);
    if (!baseUrl) throw new Error("Usage: index.ts DHIS2_URL");
    const runner = await MigrationsRunner.init({ baseUrl, debug: console.debug });
    runner.execute();
}

if (require.main === module) {
    main();
}
