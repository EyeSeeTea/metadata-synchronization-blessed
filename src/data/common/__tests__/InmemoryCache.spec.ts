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
    it("dedupe concurrent callers onto a single in-flight request", async () => {
        const cache = new InmemoryCache();
        const key = "key";
        let calls = 0;
        const promise = () => {
            calls += 1;
            return Promise.resolve(calls);
        };

        const [first, second, third] = await Promise.all([
            cache.getOrPromise(key, promise),
            cache.getOrPromise(key, promise),
            cache.getOrPromise(key, promise),
        ]);

        expect(calls).toBe(1);
        expect([first, second, third]).toEqual([1, 1, 1]);
    });
    it("evict the key when the promise rejects so a later call can retry", async () => {
        const cache = new InmemoryCache();
        const key = "key";

        await expect(cache.getOrPromise(key, () => Promise.reject(new Error("boom")))).rejects.toThrow("boom");

        const retry = await cache.getOrPromise(key, () => Promise.resolve(42));
        expect(retry).toBe(42);
    });
});

export {};
