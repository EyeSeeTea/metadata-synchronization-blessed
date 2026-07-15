import { describe, it, expect } from "vitest";
import { RuleAggregatedDataExchange } from "../../../../domain/rules/value-object/RuleAggregatedDataExchange";
import { InstanceDataStoreData } from "../../../instance/InstanceD2ApiRepository";
import { buildAggregatedDataExchangePayload } from "../buildAggregatedDataExchangePayload";

const RULE_NAME = "My rule";

const dimensions = {
    periods: ["202401"],
    orgUnits: ["ou-uid-1"],
    orgUnitCodes: ["OU_CODE_1"],
    metadataIds: ["de-uid-1"],
    metadataCodes: ["DE_CODE_1"],
};

const internalInstance: InstanceDataStoreData = {
    id: "instInternal",
    name: "Internal ADEX",
    type: "aggregated-data-exchange",
    url: "http://origin.test",
    exchangeTargetType: "internal",
};

const externalInstance: InstanceDataStoreData = {
    id: "instExternal",
    name: "External ADEX",
    type: "aggregated-data-exchange",
    url: "https://remote.test",
    exchangeTargetType: "external",
};

const buildRuleAdex = (
    instanceId: string,
    type: "internal" | "external",
    credentials?: { username: string; password: string }
) =>
    RuleAggregatedDataExchange.create({
        id: "adex-id-1",
        target: {
            instanceId,
            type,
            authType: "http-basic",
            username: credentials?.username,
            password: credentials?.password,
        },
    }).getOrThrow();

describe("buildAggregatedDataExchangePayload", () => {
    describe("internal target", () => {
        const ade = buildRuleAdex(internalInstance.id, "internal");
        const payload = buildAggregatedDataExchangePayload(ade, RULE_NAME, internalInstance, dimensions);

        it("uses INTERNAL target with no api block", () => {
            expect(payload.target).toEqual({
                type: "INTERNAL",
                request: {
                    idScheme: "UID",
                    dataElementIdScheme: "UID",
                    orgUnitIdScheme: "UID",
                    categoryOptionComboIdScheme: "UID",
                },
            });
        });

        it("uses UID schemes and UID identifiers in the source request", () => {
            expect(payload.source.requests[0]).toEqual({
                name: "My rule target: Internal ADEX",
                dx: ["de-uid-1"],
                pe: ["202401"],
                ou: ["ou-uid-1"],
                filters: [],
                inputIdScheme: "UID",
                outputIdScheme: "UID",
                outputDataElementIdScheme: "UID",
                outputOrgUnitIdScheme: "UID",
            });
        });
    });

    describe("external target", () => {
        const ade = buildRuleAdex(externalInstance.id, "external", { username: "admin", password: "district" });
        const payload = buildAggregatedDataExchangePayload(ade, RULE_NAME, externalInstance, dimensions);

        it("uses EXTERNAL target with api url and credentials", () => {
            expect(payload.target).toEqual({
                type: "EXTERNAL",
                api: { url: "https://remote.test", username: "admin", password: "district", token: undefined },
                request: {
                    idScheme: "CODE",
                    dataElementIdScheme: "CODE",
                    orgUnitIdScheme: "CODE",
                    categoryOptionComboIdScheme: "CODE",
                },
            });
        });

        it("uses CODE schemes and code identifiers in the source request", () => {
            expect(payload.source.requests[0]).toEqual({
                name: "My rule target: External ADEX",
                dx: ["DE_CODE_1"],
                pe: ["202401"],
                ou: ["OU_CODE_1"],
                filters: [],
                inputIdScheme: "CODE",
                outputIdScheme: "CODE",
                outputDataElementIdScheme: "CODE",
                outputOrgUnitIdScheme: "CODE",
            });
        });
    });

    it("keeps the top-level exchange id and name", () => {
        const ade = buildRuleAdex(internalInstance.id, "internal");
        const payload = buildAggregatedDataExchangePayload(ade, RULE_NAME, internalInstance, dimensions);

        expect(payload.id).toBe("adex-id-1");
        expect(payload.name).toBe("My rule target: Internal ADEX");
    });

    it("throws when the target instance is undefined (deleted after the rule was created)", () => {
        const ade = buildRuleAdex(externalInstance.id, "external", { username: "admin", password: "district" });

        expect(() => buildAggregatedDataExchangePayload(ade, RULE_NAME, undefined, dimensions)).toThrow(
            `Cannot build aggregated data exchange payload for rule "${RULE_NAME}": target instance "${externalInstance.id}" was not found (it may have been deleted).`
        );
    });

    it("truncates the source request name to 50 characters (E4001)", () => {
        const longRuleName = "x".repeat(60);
        const ade = buildRuleAdex(internalInstance.id, "internal");

        const payload = buildAggregatedDataExchangePayload(ade, longRuleName, internalInstance, dimensions);

        const fullName = `${longRuleName} target: ${internalInstance.name}`;
        expect(payload.name).toBe(fullName); // top-level name is not truncated
        expect(payload.source.requests[0].name).toBe(fullName.slice(0, 50));
        expect(payload.source.requests[0].name).toHaveLength(50);
    });
});
