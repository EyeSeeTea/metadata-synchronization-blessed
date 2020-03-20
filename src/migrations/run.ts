import { Config } from "./types";
import { D2Api, D2ApiDefault } from "d2-api";
import _ from "lodash";

import { getDataStore, saveDataStore, dataStoreNamespace } from "../models/dataStore";

import initial from "./tasks/01.init";
import instancesById from "./tasks/02.instances-by-id";
import rulesById from "./tasks/03.rules-by-id";

type Migration = { version: number; fn: MigrationFn };
type MigrationFn = (api: D2Api) => Promise<void>;

const migrations: Migration[] = [
    { version: 1, fn: initial },
    { version: 2, fn: instancesById },
    { version: 3, fn: rulesById },
];

type Debug = (message: string) => void;

type Options = { baseUrl: string; debug?: Debug };

async function migrate(migrations: Migration[], options: Options): Promise<void> {
    const { baseUrl, debug = _.identity } = options;
    const api = new D2ApiDefault({ baseUrl });
    const config = await getDataStore<Config>(api, "config", { version: 0 });
    const migrationsToApply = _(migrations)
        .filter(info => info.version > config.version)
        .sortBy(info => info.version)
        .value();
    const newVersion = _(migrationsToApply)
        .map(info => info.version)
        .max();

    if (!newVersion) {
        debug(`No migrations pending to run (current version: ${config.version})`);
        return;
    }

    backupDataStore(api);
    const configWithCurrentMigration: Config = { ...config, migration: { version: newVersion } };
    await saveDataStore(api, "config", configWithCurrentMigration);
    try {
        await runMigrations(migrationsToApply, api, debug);
    } catch (err) {
        console.error(err);
        rollbackDataStore(api);
        const configWithCurrentMigration: Config = {
            ...config,
            migration: { version: newVersion, error: err.message || err.toString() },
        };
        await saveDataStore(api, "config", configWithCurrentMigration);
    }

    await saveDataStore(api, "config", { version: newVersion });
}

async function runMigrations(migrations: Migration[], api: D2Api, debug: Debug) {
    for (const migration of migrations) {
        debug(`Apply migration ${migration.version}: ${migration.fn.name}`);
        await migration.fn(api);
    }
}

async function backupDataStore(api: D2Api) {
    // TODO
    //await saveDataStore(api, "backup", { version: newVersion });
    const keys = await api
        .dataStore(dataStoreNamespace)
        .getKeys()
        .getData();
    console.log(keys);
    process.exit();
}

async function rollbackDataStore(api: D2Api) {
    // TODO
    console.log("TODO", api);
}

if (require.main === module) {
    const [baseUrl] = process.argv.slice(2);
    if (!baseUrl) throw new Error("Usage: config.ts DHIS2_URL");
    migrate(migrations, { baseUrl, debug: console.debug });
}
