import { D2Api, D2ApiDefault } from "d2-api";
import _ from "lodash";

import { Config } from "./types";
import { promiseMap } from "./utils";
import { dataStoreNamespace } from "../models/dataStore";
import { getDataStore, saveDataStore, deleteDataStore } from "../models/dataStore";

import initial from "./tasks/01.init";
import instancesById from "./tasks/02.instances-by-id";
import rulesById from "./tasks/03.rules-by-id";

const migrations: Migration[] = [
    { version: 1, fn: initial },
    { version: 2, fn: instancesById },
    { version: 3, fn: rulesById },
];

type Migration = { version: number; fn: MigrationFn };
type MigrationFn = (api: D2Api) => Promise<void>;
type Debug = (message: string) => void;

interface Options {
    migrations: Migration[];
    baseUrl: string;
    debug?: Debug;
}

class MigrationRunner {
    migrations: Migration[];
    api: D2Api;
    debug: Debug;

    constructor(options: Options) {
        this.migrations = options.migrations;
        this.api = new D2ApiDefault({ baseUrl: options.baseUrl });
        this.debug = options.debug || _.identity;
    }

    async migrate(): Promise<void> {
        const { api, debug } = this;
        const config = await getDataStore<Config>(api, "config", { version: 0 });
        const { newVersion, migrationsToApply } = this.getMigrationData();

        if (!newVersion) {
            debug(`No migrations pending to run (current version: ${config.version})`);
            return;
        }

        debug(`Start migration: version=${newVersion}`);
        await this.rollBackExistingBackup(config, newVersion);
        await this.backupDataStore(config, newVersion);

        try {
            //throw new Error(`cancel: ${migrationsToApply.length}`);
            await this.runMigrations(migrationsToApply, newVersion);
        } catch (error) {
            this.rollbackDataStore(error, config, newVersion);
        }
    }

    async runMigrations(migrations: Migration[], newVersion: number) {
        const { api, debug } = this;
        for (const migration of migrations) {
            debug(`Apply migration ${migration.version}: ${migration.fn.name}`);
            await migration.fn(api);
        }
        await saveDataStore(api, "config", { version: newVersion });
    }

    async rollBackExistingBackup(config: Config, newVersion: number) {
        await this.rollbackDataStore(new Error("Rollback existing backup"), config, newVersion);
    }

    async backupDataStore(config: Config, newVersion: number) {
        const { api, debug } = this;
        debug(`Start backup`);
        const allKeys = await this.getDataStoreKeys();
        const keysToBackup = _(allKeys)
            .reject(key => key.startsWith("backup-"))
            .difference(["config"])
            .compact()
            .value();

        const configWithCurrentMigration: Config = {
            ...config,
            migration: { version: newVersion },
        };
        await saveDataStore(api, "config", configWithCurrentMigration);

        await promiseMap(keysToBackup, async key => {
            const value = await getDataStore(api, key, {});
            const backupKey = "backup-" + key;
            debug(`Backup: ${key} -> ${backupKey}`);
            await saveDataStore(api, backupKey, value);
        });
    }

    async getDataStoreKeys(): Promise<string[]> {
        return this.api
            .dataStore(dataStoreNamespace)
            .getKeys()
            .getData();
    }

    async rollbackDataStore(error: Error, config: Config, newVersion: number) {
        const { api, debug } = this;
        const errorMsg = error.message || error.toString();
        const allKeys = await this.getDataStoreKeys();
        const keysToRestore = allKeys.filter(key => key.startsWith("backup-"));

        if (_.isEmpty(keysToRestore)) return;

        debug(`Error: ${errorMsg}`);
        debug("Start Rollback");

        await promiseMap(keysToRestore, async backupKey => {
            const value = await getDataStore(api, backupKey, {});
            const key = backupKey.replace(/^backup-/, "");
            debug(`Rollback: ${backupKey} -> ${key}`);
            await saveDataStore(api, key, value);
            await deleteDataStore(api, backupKey);
        });

        const configWithCurrentMigration: Config = {
            ...config,
            migration: { version: newVersion, error: errorMsg },
        };
        await saveDataStore(api, "config", configWithCurrentMigration);
    }

    getMigrationData() {
        const migrationsToApply = _(this.migrations)
            //.filter(info => info.version > config.version)
            .sortBy(info => info.version)
            .value();
        const newVersion = _(migrationsToApply)
            .map(info => info.version)
            .max();
        return { newVersion, migrationsToApply };
    }
}

if (require.main === module) {
    const [baseUrl] = process.argv.slice(2);
    if (!baseUrl) throw new Error("Usage: config.ts DHIS2_URL");
    const runner = new MigrationRunner({ migrations, baseUrl, debug: console.debug });
    runner.migrate();
}
