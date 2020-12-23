import { Instance } from "../domain/instance/entities/Instance";
import { CompositionRoot } from "../presentation/CompositionRoot";
import { D2Api } from "../types/d2-api";

async function main() {
    const [baseUrl] = process.argv.slice(2);
    if (!baseUrl) throw new Error("Usage: index.ts DHIS2_URL");
    const api = new D2Api({ baseUrl: baseUrl, backend: "fetch" });
    const version = await api.getVersion();
    const instance = Instance.build({
        type: "local",
        name: "This instance",
        url: baseUrl,
        version,
    });

    const compositionRoot = new CompositionRoot(instance, "");
    await compositionRoot.migrations.run(console.debug);
}

main();
