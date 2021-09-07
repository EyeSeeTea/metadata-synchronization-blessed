import { Server } from "miragejs";
import { AnyFactories, AnyModels } from "miragejs/-types";
import { ServerConfig } from "miragejs/server";

export interface DhisOptions {
    version?: string;
}

export function startDhis(mirageOptions: ServerConfig<AnyModels, AnyFactories> = {}, options: DhisOptions = {}) {
    const { version = "2.30" } = options;

    const server = new Server({
        namespace: "/api",
        logging: false,
        trackRequests: true,
        ...mirageOptions,
        routes() {
            this.get("/schemas", async () => ({
                schemas: [
                    {
                        klass: "org.hisp.dhis.dataelement.DataElement",
                        shareable: true,
                        translatable: true,
                        metadata: true,
                        identifiableObject: true,
                        plural: "dataElements",
                        displayName: "Data Element",
                        name: "dataElement",
                        singular: "dataElement",
                        authorities: [],
                        properties: [],
                    },
                    {
                        klass: "org.hisp.dhis.dataset.DataSet",
                        shareable: true,
                        translatable: true,
                        metadata: true,
                        identifiableObject: true,
                        apiEndpoint: "http://taris.sferadev.com:9005/api/dataSets",
                        plural: "dataSets",
                        displayName: "Data Set",
                        name: "dataSet",
                        singular: "dataSet",
                        authorities: [],
                        properties: [],
                    },
                ],
            }));
            this.get("/attributes", async () => ({ attributes: [] }));
            this.get("/constants", async () => ({ constants: [] }));
            this.get("/me", async () => ({ userCredentials: { username: "test-user" } }));
            this.get("/me/authorization", async () => []);
            this.get("/userSettings", async () => ({
                keyDbLocale: "en",
                keyUiLocale: "en",
            }));
            this.get("/system/info", async () => ({ version }));
            this.get("/apps", async () => []);
            this.get("/dataStore/metadata-synchronization/config", async () => ({
                version: 0,
            }));
        },
    });

    server.pretender.handledRequest = function () {};
    server.pretender.unhandledRequest = function (verb, path) {
        console.error("Unknown request", verb, path);
    };

    return server;
}
