import "dotenv/config";
import fs from "fs";
import { configure, getLogger } from "log4js";
import path from "path";
import * as yargs from "yargs";
import { Instance } from "../domain/instance/entities/Instance";
import { MigrationsRunner } from "../migrations";
import { migrationTasks } from "../migrations/tasks";
import { CompositionRoot } from "../presentation/CompositionRoot";
import { D2Api } from "../types/d2-api";
import Scheduler from "./scheduler";

const development = process.env.NODE_ENV === "development";

configure({
    appenders: {
        out: { type: "stdout" },
        file: { type: "file", filename: "debug.log" },
    },
    categories: { default: { appenders: ["file", "out"], level: development ? "all" : "debug" } },
});

// Root folder on "yarn start" is ./src, ask path to go back one level
const rootFolder = development ? ".." : "";
const { config } = yargs
    .options({
        config: {
            type: "string",
            alias: "c",
            describe: "Configuration file",
            default: path.join(__dirname, rootFolder, "app-config.json"),
        },
    })
    .coerce("config", path => {
        return JSON.parse(fs.readFileSync(path, "utf8"));
    }).argv;

const checkMigrations = async (api: D2Api) => {
    const debug = getLogger("migrations").debug;
    const runner = await MigrationsRunner.init({ api, debug, migrations: migrationTasks });
    if (runner.hasPendingMigrations()) {
        getLogger("migrations").fatal("Scheduler is unable to continue due to database migrations");
        throw new Error("There are pending migrations to be applied to the data store");
    }
};

const start = async (): Promise<void> => {
    const { baseUrl, username, password, encryptionKey } = config;
    if (!baseUrl || !username || !password || !encryptionKey) {
        getLogger("main").fatal("Missing fields from configuration file");
        return;
    }

    const api = new D2Api({ baseUrl, auth: { username, password }, backend: "fetch" });
    await checkMigrations(api);

    const welcomeMessage = `Script initialized on ${baseUrl} with user ${username}`;
    getLogger("main").info("-".repeat(welcomeMessage.length));
    getLogger("main").info(welcomeMessage);

    const version = await api.getVersion();
    const instance = Instance.build({
        name: "This instance",
        url: baseUrl,
        username,
        password,
        version,
    });

    const compositionRoot = new CompositionRoot(instance, encryptionKey);
    new Scheduler(api, compositionRoot).initialize();
};

start().catch(console.error);
