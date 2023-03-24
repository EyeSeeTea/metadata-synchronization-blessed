import { InmemoryCache } from "../InmemoryCache";

describe("Inmemory cache should", () => {
    it("is empty after creation", async () => {
        const cache = new InmemoryCache();

        expect(cache.getKeys().length).toBe(0);
    });
    it("return value from promise if does not exist key in cache", async () => {
        const cache = new InmemoryCache();
        const key = "key";
        const expected = 4;

        expect(cache.get(key)).toBeUndefined();

        const promise = () => Promise.resolve(expected);

        const result = await cache.getOrPromise(key, promise);

        expect(result).toBe(expected);
    });
    it("return value from cache if exist key in cache", async () => {
        const cache = new InmemoryCache();
        const key = "key";
        const expected = 4;

        const firstPromise = () => Promise.resolve(expected);

        const firstResult = await cache.getOrPromise(key, firstPromise);

        expect(firstResult).toBe(expected);

        const secondPromise = () => Promise.resolve(5);

        const secondResult = await cache.getOrPromise(key, secondPromise);

        expect(secondResult).toBe(expected);
    });
});

export {};
