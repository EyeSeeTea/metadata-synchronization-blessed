import { command, option, run, string } from "cmd-ts";
import "dotenv/config";
import fs from "fs";
import { configure, getLogger } from "log4js";
import path from "path";
import { Instance } from "../domain/instance/entities/Instance";
import { CompositionRoot } from "../presentation/CompositionRoot";
import { D2Api } from "../types/d2-api";
import { ConfigModel, SchedulerConfig } from "./entities/SchedulerConfig";
import Scheduler from "./scheduler";

const development = process.env.NODE_ENV === "development";

configure({
    appenders: {
        out: { type: "stdout" },
        file: { type: "file", filename: "debug.log" },
    },
    categories: { default: { appenders: ["file", "out"], level: development ? "all" : "debug" } },
});

async function main() {
    const cmd = command({
        name: path.basename(__filename),
        description: "Scheduler to execute predictors on multiple DHIS2 instances",
        args: {
            config: option({
                type: string,
                long: "config",
                short: "c",
                description: "Configuration file",
            }),
        },
        handler: async args => {
            try {
                const text = fs.readFileSync(args.config, "utf8");
                const contents = JSON.parse(text);
                const config = ConfigModel.unsafeDecode(contents);
                
                await start(config);
            } catch (err) {
                getLogger("main").fatal(err);
                process.exit(1);
            }
        },
    });

    run(cmd, process.argv.slice(2));
}

const checkMigrations = async (compositionRoot: CompositionRoot) => {
    if (await compositionRoot.migrations.hasPending()) {
        getLogger("migrations").fatal("Scheduler is unable to continue due to database migrations");
        throw new Error("There are pending migrations to be applied to the data store");
    }
};

const start = async (config: SchedulerConfig): Promise<void> => {
    const { baseUrl, username, password, encryptionKey } = config;
    if (!baseUrl || !username || !password || !encryptionKey) {
        getLogger("main").fatal("Missing fields from configuration file");
        return;
    }

    const api = new D2Api({ baseUrl, auth: { username, password }, backend: "fetch" });
    const version = await api.getVersion();
    const compositionRoot = new CompositionRoot(
        Instance.build({
            type: "local",
            name: "This instance",
            url: baseUrl,
            username,
            password,
            version,
        }),
        encryptionKey
    );

    await checkMigrations(compositionRoot);

    const welcomeMessage = `Script initialized on ${baseUrl} with user ${username}`;
    getLogger("main").info("-".repeat(welcomeMessage.length));
    getLogger("main").info(welcomeMessage);

    new Scheduler(api, compositionRoot).initialize();
};

main();
