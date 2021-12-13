import { command, option, run, string } from "cmd-ts";
import "dotenv/config";
import fs from "fs";
import { configure, getLogger } from "log4js";
import path from "path";
import { Future, FutureData } from "../domain/common/entities/Future";
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

const checkMigrations = (compositionRoot: CompositionRoot): FutureData<boolean> => {
    return Future.fromPromise(compositionRoot.migrations.hasPending())
        .mapError(() => {
            return "Unable to connect with remote instance";
        })
        .flatMap(pendingMigrations => {
            if (pendingMigrations) {
                return Future.error<string, boolean>("There are pending migrations, unable to continue");
            }

            return Future.success(pendingMigrations);
        });
};

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

    await checkMigrations(compositionRoot).toPromise();

    const welcomeMessage = `Script initialized on ${baseUrl} with user ${username}`;
    getLogger("main").info("-".repeat(welcomeMessage.length));
    getLogger("main").info(welcomeMessage);

    new Scheduler(api, compositionRoot).initialize();
};

main();
