export type NonNullableValues<Obj> = { [K in keyof Obj]: NonNullable<Obj[K]> };

export type Maybe<T> = T | undefined | null;

export type Dictionary<T> = Record<string, T>;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type NonEmptyArray<T> = T[] & { 0: T };

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
    {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];

export type ArrayElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<infer ElementType>
    ? ElementType
    : never;

export function isValueInUnionType<S, T extends S>(value: S, values: readonly T[]): value is T {
    return (values as readonly S[]).indexOf(value) >= 0;
}

export function buildObject<Value>() {
    return <T>(object: { [K in keyof T]: Value }) => object;
}

export function isNotEmpty<T>(xs: T[] | undefined): xs is NonEmptyArray<T> {
    return xs ? xs.length > 0 : false;
}
