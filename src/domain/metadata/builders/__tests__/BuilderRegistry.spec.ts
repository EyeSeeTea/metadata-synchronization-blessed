import { BuilderRegistry } from "../BuilderRegistry";
import { ExportBuilder } from "../../../../types/synchronization";

describe("BuilderRegistry", () => {
    let registry: BuilderRegistry;

    beforeEach(() => {
        registry = new BuilderRegistry();
    });

    const givenMetadataPayloadBuilder = (overrides: Partial<ExportBuilder> = {}): ExportBuilder => ({
        type: "dataElements",
        ids: [],
        excludeRules: [],
        includeReferencesAndObjectsRules: [],
        includeSharingSettingsObjectsAndReferences: false,
        includeOnlySharingSettingsReferences: false,
        includeUsersObjectsAndReferences: false,
        includeOnlyUsersReferences: false,
        includeOrgUnitsObjectsAndReferences: false,
        includeOnlyOrgUnitsReferences: false,
        sharingSettingsIncludeReferencesAndObjectsRules: [],
        usersIncludeReferencesAndObjectsRules: [],
        removeUserNonEssentialObjects: false,
        ...overrides,
    });

    it("should register IDs for different contexts separately", () => {
        const builderWithUsers = givenMetadataPayloadBuilder({ includeUsersObjectsAndReferences: true });
        const builderWithoutUsers = givenMetadataPayloadBuilder({ includeUsersObjectsAndReferences: false });

        const testIds = ["id1", "id2", "id3"];

        registry.addList(builderWithUsers, testIds);

        const notRequestedIds = registry.filterNotRequested(builderWithoutUsers, testIds);
        expect(notRequestedIds).toEqual(testIds);

        const requestedIds = registry.filterNotRequested(builderWithUsers, testIds);
        expect(requestedIds).toEqual([]);
    });

    it("should filter out already registered IDs", () => {
        const builder = givenMetadataPayloadBuilder();
        const initialIds = ["id1", "id2"];
        const newIds = ["id2", "id3", "id4"];

        registry.addList(builder, initialIds);

        const notRequestedIds = registry.filterNotRequested(builder, newIds);
        expect(notRequestedIds).toEqual(["id3", "id4"]);
    });

    it("should provide correct statistics", () => {
        const builder1 = givenMetadataPayloadBuilder({ type: "dataElements" });
        const builder2 = givenMetadataPayloadBuilder({ type: "programs", includeUsersObjectsAndReferences: true });

        registry.addList(builder1, ["id1", "id2"]);
        registry.addList(builder2, ["id3", "id4", "id5"]);

        const stats = registry.getStats();
        expect(stats.totalKeys).toBe(2);
        expect(stats.totalIds).toBe(5);
        expect(stats.repeatedIds).toBe(0);
    });

    it("should count repeated IDs across different contexts", () => {
        const builder1 = givenMetadataPayloadBuilder({ type: "dataElements" });
        const builder2 = givenMetadataPayloadBuilder({ type: "dataElements", includeUsersObjectsAndReferences: true });
        const builder3 = givenMetadataPayloadBuilder({ type: "programs" });

        registry.addList(builder1, ["id1", "id2"]);
        registry.addList(builder2, ["id2", "id3"]); // id2 repeated
        registry.addList(builder3, ["id3", "id4"]); // id3 repeated

        const stats = registry.getStats();
        expect(stats.totalKeys).toBe(3);
        expect(stats.totalIds).toBe(6); // Total occurrences: id1(1) + id2(2) + id3(2) + id4(1)
        expect(stats.repeatedIds).toBe(2); // id2 and id3 are repeated
    });

    it("should clear all cached data", () => {
        const builder = givenMetadataPayloadBuilder();
        registry.addList(builder, ["id1", "id2"]);

        expect(registry.getStats().totalIds).toBe(2);
        expect(registry.getStats().repeatedIds).toBe(0);

        registry.clear();

        expect(registry.getStats().totalIds).toBe(0);
        expect(registry.getStats().totalKeys).toBe(0);
        expect(registry.getStats().repeatedIds).toBe(0);
    });

    describe("includeReferencesAndObjectsRules/excludeRules rules", () => {
        it("should differentiate cache contexts based on includeReferencesAndObjectsRules", () => {
            const builder1 = givenMetadataPayloadBuilder({
                includeReferencesAndObjectsRules: [["optionSets"], ["users"]],
            });

            const builder2 = givenMetadataPayloadBuilder({
                includeReferencesAndObjectsRules: [["optionSets"]],
            });

            registry.add(builder1, "id1");

            expect(registry.has(builder1, "id1")).toBe(true);
            expect(registry.has(builder2, "id1")).toBe(false);
        });

        it("should differentiate cache contexts based on excludeRules", () => {
            const builder1 = givenMetadataPayloadBuilder({
                excludeRules: [["users"], ["sharing"]],
            });

            const builder2 = givenMetadataPayloadBuilder({
                excludeRules: [["users"]],
            });

            registry.add(builder1, "id1");

            expect(registry.has(builder1, "id1")).toBe(true);
            expect(registry.has(builder2, "id1")).toBe(false);
        });

        it("should treat same rules in different order as equivalent", () => {
            const builder1 = givenMetadataPayloadBuilder({
                includeReferencesAndObjectsRules: [["optionSets"], ["users"]],
            });

            const builder2 = givenMetadataPayloadBuilder({
                includeReferencesAndObjectsRules: [["users"], ["optionSets"]],
            });

            registry.add(builder1, "id1");

            expect(registry.has(builder1, "id1")).toBe(true);
            expect(registry.has(builder2, "id1")).toBe(true);
        });

        it("should treat same rules in different order as equivalent (with nested props)", () => {
            const builder1 = givenMetadataPayloadBuilder({
                includeReferencesAndObjectsRules: [
                    ["optionSets", "users", "dataElements"],
                    ["users", "userGroups", "userRoles"],
                ],
            });

            const builder2 = givenMetadataPayloadBuilder({
                includeReferencesAndObjectsRules: [
                    ["users", "userRoles", "userGroups"],
                    ["optionSets", "dataElements", "users"],
                ],
            });

            registry.add(builder1, "id1");

            expect(registry.has(builder1, "id1")).toBe(true);
            expect(registry.has(builder2, "id1")).toBe(true);
        });
    });
});
