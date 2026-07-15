import { DataStoreMetadata } from "../DataStoreMetadata";

const NS = DataStoreMetadata.NS_SEPARATOR;

describe("DataStoreMetadata", () => {
    describe("buildFromKeys", () => {
        it("should build metadata from valid namespace and key ids", () => {
            const ids = [`ns1${NS}key1`, `ns1${NS}key2`, `ns2${NS}keyA`];
            const result = DataStoreMetadata.buildFromKeys(ids, []);

            expect(result).toHaveLength(2);

            const ns1 = result.find(r => r.namespace === "ns1");
            expect(ns1).toBeDefined();
            expect(ns1!.keys).toEqual([
                { id: "key1", value: "" },
                { id: "key2", value: "" },
            ]);

            const ns2 = result.find(r => r.namespace === "ns2");
            expect(ns2).toBeDefined();
            expect(ns2!.keys).toEqual([{ id: "keyA", value: "" }]);
        });

        it("should filter out excluded datastore ids", () => {
            const ids = [`ns1${NS}key1`, `ns1${NS}key2`, `ns1${NS}key3`];
            const excluded = [`ns1${NS}key2`];
            const result = DataStoreMetadata.buildFromKeys(ids, excluded);

            expect(result).toHaveLength(1);
            expect(result[0].keys).toEqual([
                { id: "key1", value: "" },
                { id: "key3", value: "" },
            ]);
        });

        it("should throw error for ids without NS_SEPARATOR", () => {
            const ids = ["invalidId"];
            expect(() => DataStoreMetadata.buildFromKeys(ids, [])).toThrow(
                "dataStore value does not match expected format: invalidId"
            );
        });

        it("should throw error for ids with multiple NS_SEPARATOR occurrences", () => {
            const ids = [`ns1${NS}key1${NS}extra`];
            expect(() => DataStoreMetadata.buildFromKeys(ids, [])).toThrow(
                "dataStore value does not match expected format"
            );
        });

        it("should return empty array for empty input", () => {
            const result = DataStoreMetadata.buildFromKeys([], []);
            expect(result).toEqual([]);
        });

        it("should build metadata with empty keys when namespace-only id is provided", () => {
            const ids = [`ns1${NS}`];
            const result = DataStoreMetadata.buildFromKeys(ids, []);

            expect(result).toHaveLength(1);
            expect(result[0].namespace).toBe("ns1");
            expect(result[0].keys).toEqual([]);
        });

        it("should exclude all ids of a namespace when all are excluded", () => {
            const ids = [`ns1${NS}key1`, `ns1${NS}key2`];
            const excluded = [`ns1${NS}key1`, `ns1${NS}key2`];
            const result = DataStoreMetadata.buildFromKeys(ids, excluded);

            expect(result).toEqual([]);
        });
    });
});
