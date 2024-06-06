import { execSync } from "child_process";
import yargs, { Argv } from "yargs";
import { ArrayElementType } from "../src/types/utils";
import fs from "fs";

const defaultVariant = "core-app";
const variants = [
    {
        type: "app",
        name: "core-app",
        title: "MetaData Synchronization",
        file: "metadata-synchronization",
    },
    {
        type: "app",
        name: "data-metadata-app",
        title: "Data/Metadata Exchange",
        file: "metadata-synchronization-data-metadata-exchange",
    },
    {
        type: "app",
        name: "module-package-app",
        title: "Module/Package Generation",
        file: "metadata-synchronization-module-package-generation",
    },
    {
        type: "app",
        name: "msf-aggregate-data-app",
        title: "MSF Aggregate Data",
        file: "metadata-synchronization-msf-aggregate-data",
    },
    {
        type: "widget",
        name: "modules-list",
        title: "MetaData Synchronization Modules List Widget",
        file: "metadata-synchronization-widget-modules-list",
    },
    {
        type: "widget",
        name: "package-exporter",
        title: "MetaData Synchronization Package Exporter Widget",
        file: "metadata-synchronization-widget-package-exporter",
    },
    {
        type: "app",
        name: "sp-emergency-responses",
        title: "Emergency Responses Sync",
        file: "emergency-responses-sync",
    },
] as const;

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
    getYargs().argv;
}

function run(cmd: string): void {
    console.debug(`Run: ${cmd}`);
    execSync(cmd, { stdio: [0, 1, 2] });
}

/* Build */

type VariantKeys = ArrayElementType<typeof variants>["name"];
type BuildArgs = { variant: "all" | VariantKeys; verbose: boolean };

function build(args: BuildArgs): void {
    const buildVariants = variants.filter(variant => args.variant === "all" || variant.name === args.variant);

    if (buildVariants.length === 0) {
        throw new Error(`Unknown variant: ${args.variant}`);
    }

    for (const variant of buildVariants) {
        Object.assign(process.env, {
            REACT_APP_PRESENTATION_TYPE: variant.type,
            REACT_APP_PRESENTATION_VARIANT: variant.name,
            REACT_APP_PRESENTATION_TITLE: variant.title,
        });

        if (args.verbose) {
            console.info(`Package name: ${variant.name}`);
        }

        const fileName = `${variant.file}.zip`;
        const manifestType = variant.type === "widget" ? "DASHBOARD_WIDGET" : "APP";

        run(`react-scripts build && cp -r i18n icon.png build`);
        run(`d2-manifest package.json build/manifest.webapp -t ${manifestType} -n '${variant.title}'`);
        if (variant.file === "metadata-synchronization") {
            updateManifestJsonFile(`build/manifest.json`, variant.title);
        }
        updateManifestNamespace(`build/manifest.webapp`, variant.file);
        run(`rm -f ${fileName}`);
        run(`cd build && zip -r ../${fileName} *`);
        console.info(`Written: ${fileName}`);
    }
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

type StartServerArgs = { variant: string; port: number; verbose: boolean };

function startServer(args: StartServerArgs): void {
    const variant = variants.find(variant => variant.name === args.variant);

    if (!variant) {
        throw new Error(`Unknown variant: ${args.variant}`);
    }

    if (args.verbose) {
        console.info(`Variant: ${args.variant}`);
        console.info(`Start server on: ${args.port}`);
    }

    Object.assign(process.env, {
        REACT_APP_PRESENTATION_TYPE: variant.type,
        REACT_APP_PRESENTATION_VARIANT: variant.name,
        REACT_APP_PRESENTATION_TITLE: variant.title,
        PORT: args.port,
    });

    run("yarn localize && d2-manifest package.json manifest.webapp");
    run("react-scripts start");
}

main();
