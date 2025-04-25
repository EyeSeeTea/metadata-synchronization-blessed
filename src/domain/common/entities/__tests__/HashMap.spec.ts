import { HashMap } from "../HashMap";

const mapAbc123 = HashMap.fromPairs([
    ["a", 1],
    ["b", 2],
    ["c", 3],
]);

describe("constructors", () => {
    test("empty", () => {
        const map = HashMap.empty();
        expect(map.size).toEqual(0);
        expectMapPairsToEqual(map, []);
    });

    test("fromPairs", () => {
        const map = HashMap.fromPairs([
            ["a", 1],
            ["b", 2],
        ]);

        expect(map.size).toEqual(2);
        expectMapPairsToEqual(map, [
            ["a", 1],
            ["b", 2],
        ]);
    });

    test("fromObject", () => {
        const map = HashMap.fromObject({ a: 1, b: 2 });

        expect(map.size).toEqual(2);
        expect(map.get("a")).toEqual(1);
        expect(map.get("b")).toEqual(2);
    });
});

describe("conversors", () => {
    test("toCollection", () => {
        expect(mapAbc123.toCollection().toArray()).toEqual([
            ["a", 1],
            ["b", 2],
            ["c", 3],
        ]);
    });

    test("toObj", () => {
        const obj = mapAbc123.toObject();
        expect(obj).toEqual({ a: 1, b: 2, c: 3 });
    });
});

describe("key/value inclusion", () => {
    test("hasKey", () => {
        expect(mapAbc123.hasKey("b")).toBe(true);
        expect(mapAbc123.hasKey("d")).toBe(false);
    });
});

describe("get", () => {
    test("returns value if present", () => {
        expect(mapAbc123.get("a")).toEqual(1);
        expect(mapAbc123.get("b")).toEqual(2);
    });

    test("returns undefined if not present", () => {
        expect(mapAbc123.get("d")).toBeUndefined();
    });
});

describe("set", () => {
    test("creates key entry for non-existing key", () => {
        expectMapPairsToEqual(mapAbc123.set("d", 4), [
            ["a", 1],
            ["b", 2],
            ["c", 3],
            ["d", 4],
        ]);
    });

    test("overwrites value for existing key", () => {
        expectMapPairsToEqual(mapAbc123.set("a", 11), [
            ["a", 11],
            ["b", 2],
            ["c", 3],
        ]);
    });
});

describe("transformations", () => {
    test("invert", () => {
        expectMapPairsToEqual(mapAbc123.invert(), [
            [1, "a"],
            [2, "b"],
            [3, "c"],
        ]);
    });

    test("invertMulti", () => {
        const mapAbc122 = HashMap.fromPairs([
            ["a", 1],
            ["b", 2],
            ["c", 2],
        ]);

        expectMapPairsToEqual(mapAbc122.invertMulti(), [
            [1, ["a"]],
            [2, ["b", "c"]],
        ]);
    });

    test("mapValues", () => {
        expectMapPairsToEqual(
            mapAbc123.mapValues(([key, value]) => `${key}${value}`),
            [
                ["a", "a1"],
                ["b", "b2"],
                ["c", "c3"],
            ]
        );
    });

    test("mapKeys", () => {
        const mapped = mapAbc123.mapKeys(([key, value]) => `${key}${value}`);
        expectMapPairsToEqual(mapped, [
            ["a1", 1],
            ["b2", 2],
            ["c3", 3],
        ]);
    });

    test("merge", () => {
        const mapAcd = HashMap.fromPairs([
            ["a", 11],
            ["c", 33],
            ["d", 44],
        ]);

        expectMapPairsToEqual(mapAbc123.merge(mapAcd), [
            ["a", 11],
            ["b", 2],
            ["c", 33],
            ["d", 44],
        ]);
    });

    test("forEach", () => {
        const output: Array<[string, number]> = [];
        mapAbc123.forEach(([key, value]) => output.push([key, value]));

        expect(output).toEqual([
            ["a", 1],
            ["b", 2],
            ["c", 3],
        ]);
    });
});

describe("filtering by key or value", () => {
    test("pick", () => {
        expectMapPairsToEqual(mapAbc123.pick(["a", "c"]), [
            ["a", 1],
            ["c", 3],
        ]);
    });

    test("pickBy", () => {
        expectMapPairsToEqual(
            mapAbc123.pickBy(([k, v]) => k !== "b" && v > 2),
            [["c", 3]]
        );
    });

    test("omit", () => {
        expectMapPairsToEqual(mapAbc123.omit(["a", "c"]), [["b", 2]]);
    });

    test("omitBy", () => {
        expectMapPairsToEqual(
            mapAbc123.omitBy(([k, v]) => k === "b" || v === 1),
            [["c", 3]]
        );
    });
});

function expectMapPairsToEqual<K, V>(map: HashMap<K, V>, pairsSet: Array<[K, V]>): void {
    expect(map.toPairs()).toEqual(expect.arrayContaining(pairsSet));
}
