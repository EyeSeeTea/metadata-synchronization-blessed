import { execSync, spawn } from "child_process";
import yargs, { Argv } from "yargs";
import * as fs from "node:fs";
import { setupVariantAssets, cleanupVariantAssets } from "./helpers/variant-assets";
import { VariantKeys, variants } from "./variants";

const defaultVariant = "core-app";

function setVariantToEnv(variant: typeof variants[number]) {
    Object.assign(process.env, {
        VITE_PRESENTATION_TYPE: variant.type,
        VITE_PRESENTATION_VARIANT: variant.name,
        VITE_PRESENTATION_TITLE: variant.title,
    });
}

function getYargs(): Argv {
    yargs
        .usage("Usage: $0 <command> [options]")
        .parserConfiguration({ "duplicate-arguments-array": false })
        .help("h")
        .alias("h", "help")
        .demandCommand()
        .strict();

    yargs.option("verbose", {
        alias: "v",
        type: "boolean",
        description: "Run with verbose logging",
    });

    yargs.command(
        "build [variant]",
        "Build a variant",
        yargs => {
            yargs.positional("variant", {
                choices: ["all", ...variants.map(w => w.name)],
                default: "all",
            });
        },
        (argv: BuildArgs) => {
            build(argv);
        }
    );

    yargs.command(
        "start-server [variant]",
        "start the development server",
        yargs => {
            yargs
                .positional("variant", {
                    choices: variants.map(w => w.name),
                    default: defaultVariant,
                })
                .option("port", {
                    alias: "p",
                    describe: "port to bind on",
                    default: process.env.PORT || "8082",
                });
        },
        (argv: StartServerArgs) => {
            startServer(argv);
        }
    );

    return yargs;
}

function main() {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    getYargs().argv;
}

function run(cmd: string): void {
    console.debug(`Run: ${cmd}`);
    execSync(cmd, { stdio: [0, 1, 2] });
}

/* Build */

type BuildArgs = { variant: "all" | VariantKeys; verbose: boolean };

function build(args: BuildArgs): void {
    const buildVariants = variants.filter(variant => args.variant === "all" || variant.name === args.variant);

    if (buildVariants.length === 0) {
        throw new Error(`Unknown variant: ${args.variant}`);
    }

    for (const variant of buildVariants) {
        setVariantToEnv(variant);

        if (args.verbose) {
            console.debug(`Package name: ${variant.name}`);
        }

        const fileName = `${variant.file}.zip`;
        const manifestType = variant.type === "widget" ? "DASHBOARD_WIDGET" : "APP";

        setupVariantAssets(variant.name);

        try {
            run(`yarn build:variant`);
            run(`d2-manifest package.json build/manifest.webapp -t ${manifestType} -n '${variant.title}'`);
            if (variant.file === "metadata-synchronization") {
                updateManifestJsonFile(`build/manifest.json`, variant.title);
            }
            updateManifestNamespace(`build/manifest.webapp`, variant.file);
            run(`rm -f ${fileName}`);
            run(`cd build && zip -r ../${fileName} *`);
            console.debug(`Written: ${fileName}`);
        } finally {
            cleanupVariantAssets(variant.name);
        }
    }

    run(`yarn build-scheduler`);
}

function updateManifestNamespace(manifestPath: string, variantFile: string) {
    if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
        manifest.activities.dhis.namespace = variantFile;
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }
}

function updateManifestJsonFile(manifestJsonPath: string, variantTitle: string) {
    if (fs.existsSync(manifestJsonPath)) {
        const manifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, "utf8"));
        Object.assign(manifestJson, { name: variantTitle, short_name: variantTitle });
        fs.writeFileSync(manifestJsonPath, JSON.stringify(manifestJson, null, 2));
    }
}

/* Start server */

function runDevServer(onExit: () => void) {
    let serverProcess: ReturnType<typeof spawn> | null = null;
    let isShuttingDown = false;

    const cleanup = () => {
        if (isShuttingDown) return;
        isShuttingDown = true;

        if (serverProcess) {
            serverProcess.kill("SIGTERM");
        }

        onExit();

        process.exit(0);
    };

    process.on("SIGINT", () => cleanup());
    process.on("SIGTERM", () => cleanup());

    serverProcess = spawn("yarn", ["start:variant"], {
        stdio: "inherit",
        env: process.env,
        shell: true,
    });

    serverProcess.on("error", error => {
        console.error("Failed to start server:", error);
        cleanup();
    });

    serverProcess.on("exit", () => {
        cleanup();
    });
}

type StartServerArgs = { variant: string; port: number; verbose: boolean };

function startServer(args: StartServerArgs): void {
    const variant = variants.find(variant => variant.name === args.variant);

    if (!variant) {
        throw new Error(`Unknown variant: ${args.variant}`);
    }

    if (args.verbose) {
        console.debug(`Variant: ${args.variant}`);
        console.debug(`Start server on: ${args.port}`);
    }

    setVariantToEnv(variant);
    Object.assign(process.env, { PORT: args.port });

    setupVariantAssets(variant.name);

    runDevServer(() => {
        cleanupVariantAssets(variant.name);
    });
}

main();
