import { D2Api } from "../types/d2-api";
import { MigrationsRunner } from "./index";
import { getMigrationTasks } from "./tasks";

async function main() {
    const [baseUrl] = process.argv.slice(2);
    if (!baseUrl) throw new Error("Usage: index.ts DHIS2_URL");
    const api = new D2Api({ baseUrl: baseUrl, backend: "fetch" });
    const runner = await MigrationsRunner.init({
        api,
        debug: console.debug,
        migrations: await getMigrationTasks(),
        dataStoreNamespace: "metadata-synchronization",
    });
    runner.execute();
}

main();
