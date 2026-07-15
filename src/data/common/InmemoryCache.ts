export class InmemoryCache {
    private cache: Map<string, unknown> = new Map();

    getKeys(): string[] {
        return Array.from(this.cache.keys());
    }

    get<T>(cacheKey: string): T {
        return this.cache.get(cacheKey) as T;
    }

    async getOrPromise<T>(cacheKey: string, promise: () => Promise<T>): Promise<T> {
        if (this.cache.has(cacheKey)) {
            // Cached entry may be an in-flight promise or a resolved value; awaiting handles both.
            return (await this.cache.get(cacheKey)) as T;
        } else {
            // Cache the in-flight promise so concurrent callers reuse it instead of duplicating the request.
            const inFlight = promise();
            this.cache.set(cacheKey, inFlight);

            try {
                const data = await inFlight;
                this.cache.set(cacheKey, data);
                return data;
            } catch (error) {
                // Evict on failure so a later call can retry instead of caching the rejection.
                this.cache.delete(cacheKey);
                throw error;
            }
        }
    }

    clear(): void {
        this.cache.clear();
    }
}
