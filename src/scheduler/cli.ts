import { command, option, run, string } from "cmd-ts";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { Future, FutureData } from "../domain/common/entities/Future";
import { Instance } from "../domain/instance/entities/Instance";
import { CompositionRoot } from "../presentation/CompositionRoot";
import { D2Api } from "../types/d2-api";
import { ConfigModel, SchedulerConfig } from "./entities/SchedulerConfig";
import Scheduler from "./Scheduler";
import { SchedulerPresenter } from "./SchedulerPresenter";
import LoggerLog4js from "./LoggerLog4js";

const isDevelopment = process.env.NODE_ENV === "development";

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
            const logger = new LoggerLog4js(isDevelopment);

            try {
                const text = fs.readFileSync(args.config, "utf8");
                const contents = JSON.parse(text);
                const config = ConfigModel.unsafeDecode(contents);

                await start(config, logger);
            } catch (error) {
                const errorMessage = typeof error === "string" ? error : JSON.stringify(error, null, 2);
                logger.fatal("main", `${errorMessage}`);
                process.exit(1);
            }
        },
    });

    run(cmd, process.argv.slice(2));
}

const start = async (config: SchedulerConfig, logger: LoggerLog4js): Promise<void> => {
    const { baseUrl, username, password, encryptionKey } = config;
    if (!baseUrl || !username || !password || !encryptionKey) {
        logger.fatal("main", "Missing fields from configuration file");
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
    logger.info("main", "-".repeat(welcomeMessage.length));
    logger.info("main", welcomeMessage);

    const scheduler = new Scheduler();
    const schedulerPresenter = new SchedulerPresenter({
        scheduler: scheduler,
        logger: logger,
        compositionRoot: compositionRoot,
    });
    schedulerPresenter.initialize(api.apiPath);
};

main();
