import _ from "lodash";
import { D2Api } from "../types/d2-api";
import { promiseMap } from "../utils/common";
import { Config, Debug, MigrationWithVersion, RunnerOptions } from "./types";
import { zeroPad } from "./utils";

const configKey = "config";

export class MigrationsRunner {
    public migrations: MigrationWithVersion[];
    public debug: Debug;
    public appVersion: number;
    private backupPrefix = "backup-";
    private namespace: string;

    constructor(private api: D2Api, private config: Config, private options: RunnerOptions) {
        const { debug = _.identity, migrations } = options;
        this.appVersion = _.max(migrations.map(info => info.version)) || 0;
        this.debug = debug;
        this.migrations = this.getMigrationToApply(migrations, config);
        this.namespace = options.dataStoreNamespace;
    }

    setDebug(debug: Debug) {
        const newOptions = { ...this.options, debug };
        return new MigrationsRunner(this.api, this.config, newOptions);
    }

    static async init(options: RunnerOptions): Promise<MigrationsRunner> {
        const { api } = options;
        const config = await getDataStore<Config>(api, options.dataStoreNamespace, configKey, {
            version: 0,
        });
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

        debug(`Migrate: version ${this.instanceVersion} to version ${this.appVersion}`);

        await this.runMigrations(migrations);
    }

    async runMigrations(migrations: MigrationWithVersion[]): Promise<Config> {
        const { api, debug, config, namespace } = this;

        const configWithCurrentMigration: Config = {
            ...config,
            migration: { version: this.appVersion },
        };
        await saveDataStore(api, namespace, configKey, configWithCurrentMigration);

        await checkCurrentUserIsSuperadmin(api, debug);

        for (const migration of migrations) {
            debug(`Apply migration ${zeroPad(migration.version, 2)} - ${migration.name}`);
            try {
                await migration.migrate(api, debug);
            } catch (error) {
                const errorMsg = `${migration.name}: ${error.message}`;
                await this.saveConfig({ errorMsg });
                throw error;
            }
        }

        const newConfig = { version: this.appVersion };
        await saveDataStore(api, namespace, configKey, newConfig);
        return newConfig;
    }

    // dataStore backup methods are currently unused, call only if a migration needs it.

    async deleteBackup() {
        try {
            const { debug, api, namespace } = this;
            const backupKeys = await this.getBackupKeys();
            debug(`Delete backup entries`);

            await promiseMap(backupKeys, async backupKey => {
                await deleteDataStore(api, namespace, backupKey);
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
        const { api, debug, namespace } = this;
        debug(`Backup data store`);
        const allKeys = await this.getDataStoreKeys();
        const keysToBackup = _(allKeys)
            .reject(key => key.startsWith(this.backupPrefix))
            .difference([configKey])
            .compact()
            .value();

        await promiseMap(keysToBackup, async key => {
            const value = await getDataStore(api, namespace, key, {});
            const backupKey = this.backupPrefix + key;
            await saveDataStore(api, namespace, backupKey, value);
        });
    }

    async getDataStoreKeys(): Promise<string[]> {
        return this.api.dataStore(this.options.dataStoreNamespace).getKeys().getData();
    }

    async getBackupKeys() {
        const allKeys = await this.getDataStoreKeys();
        return allKeys.filter(key => key.startsWith(this.backupPrefix));
    }

    async rollbackDataStore(error: Error): Promise<Config> {
        const { api, debug, config, namespace } = this;
        const errorMsg = error.message || error.toString();
        const keysToRestore = await this.getBackupKeys();

        if (_.isEmpty(keysToRestore)) return config;

        debug(`Error: ${errorMsg}`);
        debug("Start rollback");

        await promiseMap(keysToRestore, async backupKey => {
            const value = await getDataStore(api, namespace, backupKey, {});
            const key = backupKey.replace(/^backup-/, "");
            await saveDataStore(api, namespace, key, value);
            await deleteDataStore(api, namespace, backupKey);
        });

        return this.saveConfig({ errorMsg });
    }

    private async saveConfig(options: { errorMsg?: string } = {}) {
        const { errorMsg } = options;
        const newConfig: Config = {
            ...this.config,
            migration: { version: this.appVersion, error: errorMsg },
        };
        await saveDataStore(this.api, this.namespace, configKey, newConfig);
        return newConfig;
    }

    getMigrationToApply(allMigrations: MigrationWithVersion[], config: Config) {
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

async function checkCurrentUserIsSuperadmin(api: D2Api, debug: Debug) {
    debug("Check that current user is superadmin");
    const currentUser = await api.currentUser.get({ fields: { authorities: true } }).getData();

    if (!currentUser.authorities.includes("ALL"))
        throw new Error("Only a user with authority ALL can run this migration");
}

export async function getDataStore<T extends object>(
    api: D2Api,
    dataStoreNamespace: string,
    dataStoreKey: string,
    defaultValue: T
): Promise<T> {
    const dataStore = api.dataStore(dataStoreNamespace);
    const value = await dataStore.get<T>(dataStoreKey).getData();
    if (!value) await dataStore.save(dataStoreKey, defaultValue).getData();
    return value ?? defaultValue;
}

export async function saveDataStore(
    api: D2Api,
    dataStoreNamespace: string,
    dataStoreKey: string,
    value: any
): Promise<void> {
    const dataStore = api.dataStore(dataStoreNamespace);
    await dataStore.save(dataStoreKey, value).getData();
}

export async function deleteDataStore(
    api: D2Api,
    dataStoreNamespace: string,
    dataStoreKey: string
): Promise<void> {
    try {
        await api.delete(`/dataStore/${dataStoreNamespace}/${dataStoreKey}`).getData();
    } catch (error) {
        if (!error.response || error.response.status !== 404) {
            throw error;
        }
    }
}
