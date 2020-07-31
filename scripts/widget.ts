import { execSync } from "child_process";
import yargs, { Argv } from "yargs";

type Widget = { name: string; description: string };

const widgets: Widget[] = [
    {
        name: "modules-list",
        description: "MetaData Synchronization Modules List Widget",
    },
    {
        name: "package-exporter",
        description: "MetaData Synchronization Package Exporter Widget",
    },
];

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
        "build <appName> <widget>",
        "Build a widget",
        yargs => {
            yargs
                .positional("appName", {
                    describe: "Application name",
                })
                .positional("widget", {
                    choices: widgets.map(w => w.name),
                });
        },
        (argv: BuildArgs) => {
            build(argv);
        }
    );

    yargs.command(
        "start-server <widget>",
        "start the development server for a widget",
        yargs => {
            yargs
                .positional("widget", {
                    choices: widgets.map(w => w.name),
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

type BuildArgs = { appName: string; widget: string; verbose: boolean };

function build(args: BuildArgs): void {
    const widget = widgets.find(w => w.name === args.widget);
    if (!widget) throw new Error(`Unknown widget: ${args.widget}`);

    const packageName = [args.appName, "widget", widget.name].join("-");
    Object.assign(process.env, {
        REACT_APP_DASHBOARD_WIDGET: args.widget,
    });

    if (args.verbose) {
        console.info(`Widget: ${widget.name}`);
        console.info(`Package name: ${packageName}`);
    }

    run(`yarn build`);
    run(`yarn manifest -t DASHBOARD_WIDGET -n '${widget.description}'`);
    run(`rm -f ${packageName}`);
    run(`cd build && zip -r ../${packageName} *`);
    console.info(`Written: ${packageName}.zip`);
}

/* Start server */

type StartServerArgs = { widget: string; port: number; verbose: boolean };

function startServer(args: StartServerArgs): void {
    const widgetName = args.widget;
    if (args.verbose) {
        console.info(`Widget: ${widgetName}`);
        console.info(`Start server on: ${args.port}`);
    }
    Object.assign(process.env, {
        REACT_APP_DASHBOARD_WIDGET: widgetName,
        PORT: args.port,
    });
    run("yarn start");
}

main();
