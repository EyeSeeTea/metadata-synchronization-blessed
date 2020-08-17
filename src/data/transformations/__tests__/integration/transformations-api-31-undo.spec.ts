import { Request, Server } from "miragejs";
import _ from "lodash";
import { AnyRegistry } from "miragejs/-types";
import Schema from "miragejs/orm/schema";
import { startDhis } from "../../../../../config/dhisServer";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { MetadataSyncUseCase } from "../../../../domain/metadata/usecases/MetadataSyncUseCase";
import { SynchronizationBuilder } from "../../../../types/synchronization";
import { buildRepositoryFactory } from "./factories";

const repositoryFactory = buildRepositoryFactory();

describe("Sync metadata 31->30", () => {
    let local: Server;
    let remote: Server;

    beforeAll(() => {
        jest.setTimeout(30000);
    });

    beforeEach(() => {
        local = startDhis({ urlPrefix: "http://origin.test" }, { version: "2.31" });
        remote = startDhis(
            { urlPrefix: "http://destination.test", pretender: local.pretender },
            { version: "2.30" }
        );

        local.get("/metadata", async () => ({
            charts: [
                {
                    id: "chart-line",
                    type: "LINE",
                },
                {
                    id: "chart-over-line",
                    type: "YEAR_OVER_YEAR_LINE",
                },
                {
                    id: "chart-over-column",
                    type: "YEAR_OVER_YEAR_COLUMN",
                },
            ],
        }));

        remote.get("/metadata", async () => ({}));

        local.get("/dataStore/metadata-synchronization/instances", async () => [
            {
                id: "DESTINATION",
                name: "Destination test",
                url: remote.urlPrefix,
                username: "test",
                password: "",
                description: "",
            },
        ]);

        const addMetadataToDb = async (schema: Schema<AnyRegistry>, request: Request) => {
            schema.db.metadata.insert(JSON.parse(request.requestBody));

            return {
                status: "OK",
                stats: { created: 1, updated: 0, deleted: 0, ignored: 0, total: 1 },
                typeReports: [],
            };
        };

        local.db.createCollection("metadata", []);
        local.post("/metadata", addMetadataToDb);

        remote.db.createCollection("metadata", []);
        remote.post("/metadata", addMetadataToDb);
    });

    afterEach(() => {
        local.shutdown();
        remote.shutdown();
    });

    it("Local server to remote - chart TYPE - API 31 to API 30", async () => {
        const localInstance = Instance.build({
            url: local.urlPrefix,
            name: "Testing",
            version: "2.31",
        });

        const builder: SynchronizationBuilder = {
            originInstance: "LOCAL",
            targetInstances: ["DESTINATION"],
            metadataIds: ["chart-line", "chart-over-line", "chart-over-column"],
            excludedIds: [],
        };

        const useCase = new MetadataSyncUseCase(builder, repositoryFactory, localInstance, "");

        for await (const { done } of useCase.execute()) {
            if (done) console.log("Done");
        }

        const payloads = remote.db.metadata.where({});
        expect(payloads).toHaveLength(1);
        const payload = payloads[0];

        const chartsById = _.keyBy(payload.charts || [], chart => chart.id);
        expect(chartsById["chart-line"]?.type).toEqual("LINE");
        expect(chartsById["chart-over-line"]?.type).toEqual("LINE");
        expect(chartsById["chart-over-column"]?.type).toEqual("COLUMN");

        expect(local.db.metadata.where({})).toHaveLength(0);
    });
});

export {};
