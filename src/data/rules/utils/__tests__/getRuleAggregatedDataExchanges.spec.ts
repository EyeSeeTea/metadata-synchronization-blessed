import { Server } from "miragejs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { startDhis } from "../../../../utils/dhisServer";
import { getD2APiFromInstance } from "../../../../utils/d2-utils";
import { InstanceDataStoreData } from "../../../instance/InstanceD2ApiRepository";
import { getRuleAggregatedDataExchanges } from "../getRuleAggregatedDataExchanges";

const LOCAL_URL = "http://origin.test";
const REMOTE_URL = "https://remote.test";

const localInstance = Instance.build({ url: LOCAL_URL, name: "Testing", version: "2.40", type: "local" });

const request = {
    dataElementIdScheme: "UID",
    orgUnitIdScheme: "UID",
    categoryOptionComboIdScheme: "UID",
    idScheme: "UID",
};

const internalExchange = {
    id: "adexInternal1",
    name: "Internal exchange",
    source: { requests: [] },
    target: { type: "INTERNAL", request },
};

const externalExchange = {
    id: "adexExternal1",
    name: "External exchange",
    source: { requests: [] },
    target: {
        type: "EXTERNAL",
        api: { url: REMOTE_URL, username: "admin", password: "district" },
        request,
    },
};

const instances: InstanceDataStoreData[] = [
    { id: "instInternal", type: "aggregated-data-exchange", url: LOCAL_URL, exchangeTargetType: "internal" },
    { id: "instExternal", type: "aggregated-data-exchange", url: REMOTE_URL, exchangeTargetType: "external" },
];

describe("getRuleAggregatedDataExchanges", () => {
    let local: Server;

    beforeEach(() => {
        local = startDhis({ urlPrefix: LOCAL_URL });
        local.get("/aggregateDataExchanges", async () => ({
            aggregateDataExchanges: [internalExchange, externalExchange],
        }));
    });

    afterEach(() => {
        local.shutdown();
    });

    it("maps internal exchanges without credentials and external exchanges with credentials matched by URL", async () => {
        const api = getD2APiFromInstance(localInstance);

        const result = await getRuleAggregatedDataExchanges(
            api,
            [{ id: "adexInternal1" }, { id: "adexExternal1" }],
            instances
        );

        expect(result.map(rule => rule.toProps())).toEqual([
            {
                id: "adexInternal1",
                target: { instanceId: "instInternal", type: "internal", authType: "http-basic" },
            },
            {
                id: "adexExternal1",
                target: {
                    instanceId: "instExternal",
                    type: "external",
                    authType: "http-basic",
                    username: "admin",
                    password: "district",
                },
            },
        ]);
    });
});
