import memoize from "nano-memoize";

/* Cache a lazy class-property getter */
export const cache = (options?: object) =>
    function<Res>(
        _target: Object,
        _key: string | symbol,
        descriptor: TypedPropertyDescriptor<Res>
    ) {
        let cachedValue: Res | undefined = undefined;
        let cachedMethod: Function;

        const originalGetter = descriptor.get;
        const originalMethod = (descriptor.value as unknown) as Function;

        if (originalGetter) {
            descriptor.get = function() {
                if (!cachedValue) cachedValue = originalGetter.bind(this)();
                return cachedValue;
            };
        } else if (originalMethod) {
            //@ts-ignore Not sure how to infer return type
            descriptor.value = function(...args: any[]) {
                if (!cachedMethod) cachedMethod = memoize(originalMethod.bind(this), options);
                return cachedMethod(...args);
            };
        } else {
            throw new Error("This decorator can only be applied on class properties or methods");
        }
    };

/* Define a lazy cached property of an object */
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
