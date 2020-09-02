export type Matcher<KindField extends string, Kind extends string, Obj, Result> = {
    [K in Kind]: (obj: Extract<Obj, { [F in KindField]: K }>) => Result;
};

export function match<KindField extends string>(field: KindField) {
    return function <
        Obj extends { [K in KindField]: Kind },
        Result,
        Kind extends string = Obj[KindField]
    >(obj: Obj, matcher: Matcher<KindField, Kind, Obj, Result>): Result {
        const fn = matcher[obj[field]];
        return fn(obj as Parameters<typeof fn>[0]);
    };
}

export const matchByType = match("type");
