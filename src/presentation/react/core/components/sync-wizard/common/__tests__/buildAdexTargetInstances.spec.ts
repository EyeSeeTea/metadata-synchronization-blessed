import { describe, it, expect } from "vitest";
import { Instance } from "../../../../../../../domain/instance/entities/Instance";
import { RuleAggregatedDataExchange } from "../../../../../../../domain/rules/value-object/RuleAggregatedDataExchange";
import { buildAdexTargetInstances } from "../InstanceSelectionStep";

const INTERNAL_ID = "internal01";
const EXTERNAL_ID = "external01";

const buildAdexInstance = (id: string, exchangeTargetType: "external" | "internal"): Instance =>
    Instance.build({ id, name: id, type: "aggregated-data-exchange", url: "http://test", exchangeTargetType });

const availableInstances = [buildAdexInstance(INTERNAL_ID, "internal"), buildAdexInstance(EXTERNAL_ID, "external")];

describe("buildAdexTargetInstances", () => {
    it("auto-creates a credential-less internal entry for a selected internal instance", () => {
        const result = buildAdexTargetInstances([INTERNAL_ID], [], availableInstances);

        expect(result).toHaveLength(1);
        expect(result[0].target).toEqual({ instanceId: INTERNAL_ID, type: "internal", authType: "http-basic" });
    });

    it("does not create an entry for an external instance without existing credentials", () => {
        const result = buildAdexTargetInstances([EXTERNAL_ID], [], availableInstances);

        expect(result).toEqual([]);
    });

    it("keeps the existing entry for a still-selected instance instead of recreating it", () => {
        const existing = RuleAggregatedDataExchange.create({
            id: "adex01",
            target: { instanceId: EXTERNAL_ID, type: "external", authType: "http-basic", username: "u", password: "p" },
        }).getOrThrow();

        const result = buildAdexTargetInstances([EXTERNAL_ID], [existing], availableInstances);

        expect(result).toEqual([existing]);
    });

    it("keeps existing external entries and auto-creates the internal one for a mixed selection", () => {
        const existingExternal = RuleAggregatedDataExchange.create({
            id: "adex01",
            target: { instanceId: EXTERNAL_ID, type: "external", authType: "http-basic", username: "u", password: "p" },
        }).getOrThrow();

        const result = buildAdexTargetInstances([EXTERNAL_ID, INTERNAL_ID], [existingExternal], availableInstances);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(existingExternal);
        expect(result[1].target).toEqual({ instanceId: INTERNAL_ID, type: "internal", authType: "http-basic" });
    });
});
