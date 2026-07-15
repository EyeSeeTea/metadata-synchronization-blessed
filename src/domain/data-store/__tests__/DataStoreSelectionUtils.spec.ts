import { computeDataStoreSelection } from "../DataStoreSelectionUtils";

describe("computeDataStoreSelection", () => {
    const structure = {
        nsA: ["nsA-key1", "nsA-key2", "nsA-key3"],
        nsB: ["nsB-key1", "nsB-key2"],
    };
    const { rows, parseChildren } = buildTestFixture(structure);

    describe("select namespace -> all keys included", () => {
        it("should include namespace and all its keys when namespace is selected", () => {
            const result = computeDataStoreSelection({
                included: ["nsA"],
                newlySelectedIds: ["nsA"],
                newlyUnselectedIds: [],
                excludedIds: [],
                rows,
                parseChildren,
            });

            expect(result.included).toContain("nsA");
            expect(result.included).toContain("nsA-key1");
            expect(result.included).toContain("nsA-key2");
            expect(result.included).toContain("nsA-key3");
        });
    });

    describe("deselect one key after selecting namespace", () => {
        it("should remove namespace from included but keep other keys (bug fix case)", () => {
            // State: nsA and all its keys were previously selected.
            // User deselects nsA-key2.
            // The table reports included without nsA-key2, and nsA still in included
            // because the table checkbox hasn't been recalculated yet.
            const currentIncluded = ["nsA", "nsA-key1", "nsA-key3"];

            const result = computeDataStoreSelection({
                included: currentIncluded,
                newlySelectedIds: [],
                newlyUnselectedIds: ["nsA-key2"],
                excludedIds: [],
                rows,
                parseChildren,
            });

            // Namespace should be removed because not all children are selected
            expect(result.included).not.toContain("nsA");
            // Remaining keys should stay
            expect(result.included).toContain("nsA-key1");
            expect(result.included).toContain("nsA-key3");
            // Deselected key should not be included
            expect(result.included).not.toContain("nsA-key2");
        });
    });

    describe("deselect namespace -> namespace and all keys removed", () => {
        it("should remove namespace and all its keys", () => {
            const result = computeDataStoreSelection({
                included: [],
                newlySelectedIds: [],
                newlyUnselectedIds: ["nsA"],
                excludedIds: [],
                rows,
                parseChildren,
            });

            expect(result.included).not.toContain("nsA");
            expect(result.included).not.toContain("nsA-key1");
            expect(result.included).not.toContain("nsA-key2");
            expect(result.included).not.toContain("nsA-key3");
        });
    });

    describe("select a single key without touching namespace", () => {
        it("should include only that key, not the namespace", () => {
            const result = computeDataStoreSelection({
                included: ["nsA-key1"],
                newlySelectedIds: ["nsA-key1"],
                newlyUnselectedIds: [],
                excludedIds: [],
                rows,
                parseChildren,
            });

            expect(result.included).toContain("nsA-key1");
            // Namespace should NOT be auto-selected since not all keys are selected
            expect(result.included).not.toContain("nsA");
            expect(result.included).not.toContain("nsA-key2");
            expect(result.included).not.toContain("nsA-key3");
        });
    });

    describe("select all keys individually -> namespace auto-selected", () => {
        it("should auto-select namespace when all its keys are selected", () => {
            const result = computeDataStoreSelection({
                included: ["nsA-key1", "nsA-key2", "nsA-key3"],
                newlySelectedIds: ["nsA-key3"],
                newlyUnselectedIds: [],
                excludedIds: [],
                rows,
                parseChildren,
            });

            expect(result.included).toContain("nsA");
            expect(result.included).toContain("nsA-key1");
            expect(result.included).toContain("nsA-key2");
            expect(result.included).toContain("nsA-key3");
        });
    });

    describe("multiple namespaces independence", () => {
        it("should not affect other namespaces when selecting one", () => {
            const result = computeDataStoreSelection({
                included: ["nsA"],
                newlySelectedIds: ["nsA"],
                newlyUnselectedIds: [],
                excludedIds: [],
                rows,
                parseChildren,
            });

            expect(result.included).toContain("nsA");
            expect(result.included).not.toContain("nsB");
            expect(result.included).not.toContain("nsB-key1");
            expect(result.included).not.toContain("nsB-key2");
        });
    });
});

/**
 * Test helper: simulates a datastore table with namespaces (parents) and keys (children).
 * Each namespace row has its keys stored in a "children" property.
 * parseChildren extracts child ids from matching rows.
 */
function buildTestFixture(structure: Record<string, string[]>) {
    const rows = Object.entries(structure).flatMap(([namespace, keys]) => [
        { id: namespace, children: keys.map(k => ({ id: k })) },
        ...keys.map(k => ({ id: k, children: [] })),
    ]);

    const parseChildren = (ids: string[]) => {
        return ids.flatMap(id => {
            const row = rows.find(r => r.id === id);
            return row ? row.children.map(c => c.id) : [];
        });
    };

    const plainRows = rows.map(r => ({ id: r.id }));

    return { rows: plainRows, parseChildren };
}
