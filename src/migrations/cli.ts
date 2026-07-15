import { Instance } from "../domain/instance/entities/Instance";
import { CompositionRoot } from "../presentation/CompositionRoot";
import { D2Api } from "../types/d2-api";

async function main() {
    const [fullUrl] = process.argv.slice(2);
    const { baseUrl, username, password } = extractParams(fullUrl);
    if (!username || !password || !baseUrl) throw new Error("Usage: index.ts DHIS2_URL");

    const api = new D2Api({
        baseUrl: baseUrl,
        backend: "fetch",
        auth: { username: username, password: password },
    });
    const version = await api.getVersion();
    const instance = Instance.build({
        type: "local",
        name: "This instance",
        url: baseUrl,
        username: username,
        password: password,
        version,
    });

    const compositionRoot = new CompositionRoot(instance);
    await compositionRoot.migrations.run(console.debug);
}

/**
 * Extracts the base URL, username, and password from a full URL string.
 * The URL should be in the format: http://username:password@host:port/path
 */
function extractParams(urlString: string): { baseUrl: string; username: string; password: string } {
    const url = new URL(urlString);
    const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
    const [username, password] = url.username && url.password ? [url.username, url.password] : ["", ""];
    return { baseUrl, username, password };
}

main();
