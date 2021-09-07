import _ from "lodash";
import { Dictionary } from "../types/utils";

type ArgumentsCache = Map<string, unknown>;
type FunctionCache = Map<unknown, ArgumentsCache>;
type MethodCache = Map<Function, FunctionCache>;

// Cache that stores a map of serialized arguments with their results under function descriptors
const methodCache: MethodCache = new Map();
const functionCache: FunctionCache = new Map();

interface CacheOptions {
    maxArgs?: number;
}

// Decorator to cache class properties and methods
export const cache = (options: CacheOptions = {}): any =>
    function (_target: unknown, _key: string | symbol, descriptor: PropertyDescriptor) {
        const prop = descriptor.value ? "value" : "get";
        const originalFunction = descriptor[prop];
        const map: FunctionCache = new Map();

        descriptor[prop] = function (...args: unknown[]) {
            // Serialize arguments to build a key
            const { maxArgs = args.length } = options;
            const position = Math.max(0, maxArgs);
            const key = JSON.stringify(sort(args.slice(0, position)));

            // Create a new map if it's the first time the instance has been cached
            if (!map.has(this)) map.set(this, new Map());
            const cache = map.get(this);

            // If there's a memoized value, return it instead of re-calculating
            const memoizedValue = cache?.get(key);
            if (memoizedValue) return memoizedValue;

            // Compute the default value, store it and return it
            const result = originalFunction.apply(this, args);
            cache?.set(key, result);
            return result;
        };

        methodCache.set(descriptor[prop], map);

        return descriptor;
    };

// Wrapper to memoize functions
export function memoize<Obj extends object | void, Args extends any[], U>(fn: (...args: Args) => U) {
    const map: ArgumentsCache = new Map();

    const result = function (this: Obj, ...args: Args) {
        const key = JSON.stringify(args);
        if (map.has(key)) return map.get(key);

        const result = fn.apply(this, args);
        map.set(key, result);
        return result;
    };

    functionCache.set(result, map);

    return result;
}

// Function to clear memoized storage
export const clear = (fn: Function, instance?: Dictionary<any>) => {
    // Clear method entries
    const methodEntries = methodCache.get(fn);
    if (methodEntries) methodEntries?.get(instance)?.clear();

    // Clear function entries
    const functionEntries = functionCache.get(fn);
    if (functionEntries) functionEntries.clear();
};

// Define a lazy cached property of an object
export function defineLazyCachedProperty<Obj extends object, Key extends keyof Obj, Res>(
    object: Obj,
    name: Key,
    get: () => Res
): void {
    let cachedValue: Res | undefined = undefined;

    Object.defineProperty(object, name, {
        get: () => {
            if (!cachedValue) cachedValue = get();
            return cachedValue;
        },
        enumerable: true,
        configurable: true,
    });
}

function sort(item: unknown): unknown {
    if (Array.isArray(item)) {
        return _(item).map(sort).sort();
    } else if (typeof item === "object") {
        return _(item).mapValues(sort).toPairs().sortBy(0).fromPairs().value();
    } else {
        return item;
    }
}
