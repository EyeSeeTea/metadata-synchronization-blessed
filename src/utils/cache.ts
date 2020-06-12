// Cache that stores a map of serialized arguments with their results under function descriptors
const fnCache: Map<Function, Map<string, unknown>> = new Map();

// Decorator to cache class properties and methods
export const cache = () =>
    function(_target: unknown, _key: string | symbol, descriptor: PropertyDescriptor) {
        const prop = descriptor.value ? "value" : "get";
        const originalFunction = descriptor[prop];
        const map = new Map();

        descriptor[prop] = function(...args: unknown[]) {
            const key = JSON.stringify(args);
            if (map.has(key)) return map.get(key);

            const result = originalFunction.apply(this, args);
            map.set(key, result);
            return result;
        };

        fnCache.set(descriptor[prop], map);

        return descriptor;
    };

// Wrapper to memoize functions
export function memoize<Obj extends object | void, Args extends any[], U>(
    fn: (...args: Args) => U
) {
    const map = new Map();

    const result = function(this: Obj, ...args: Args) {
        const key = JSON.stringify(args);
        if (map.has(key)) return map.get(key);

        const result = fn.apply(this, args);
        map.set(key, result);
        return result;
    };

    fnCache.set(result, map);

    return result;
}

// Function to clear memoized storage
export const clear = (fn: Function) => {
    const entries = fnCache.get(fn);
    entries?.clear();
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
