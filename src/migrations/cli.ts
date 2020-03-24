import _ from "lodash";
import path from "path";
import fs from "fs";
import { Migration } from "../types/migrations";
import { MigrationsRunner } from ".";

function getMigrationsForNode(): Migration[] {
    const directory = path.join(__dirname, "tasks");
    const keys = _.sortBy(fs.readdirSync(directory));

    return keys.map(key => {
        const fn = require("./tasks/" + key).default;
        const match = key.match(/(\d+)/);
        if (!match) throw new Error(`Cannot get version from task: ${key}`);
        const version = parseInt(match[1]);
        return { version, fn, name: key };
    });
}

async function main() {
    const [baseUrl] = process.argv.slice(2);
    if (!baseUrl) throw new Error("Usage: index.ts DHIS2_URL");
    const migrations = getMigrationsForNode();
    const runner = await MigrationsRunner.init({ baseUrl, debug: console.debug, migrations });
    runner.execute();
}

main();
