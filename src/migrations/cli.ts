import axiosRetry from "axios-retry";
import { D2ApiDefault } from "d2-api";
import { MigrationsRunner } from "./index";
import { getMigrationsForNode } from "./utils";

async function main() {
    const [baseUrl] = process.argv.slice(2);
    if (!baseUrl) throw new Error("Usage: index.ts DHIS2_URL");
    const migrations = getMigrationsForNode();
    const api = new D2ApiDefault({ baseUrl: baseUrl });
    axiosRetry(api.connection, { retries: 3 });
    const runner = await MigrationsRunner.init({ api, debug: console.debug, migrations });
    runner.execute();
}

main();
