type AllKeysOfUnion<U> = U extends any ? keyof U : never;

type NonCommonKeysOfUnion<U> = Exclude<AllKeysOfUnion<U>, keyof U>;

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type UnionWithKeys<U, K extends keyof any> = U extends any
    ? { [Key in K]: Key extends keyof U ? U[Key] : never }
    : never;

export type FlattenUnion<U> = PartialBy<
    UnionWithKeys<U, AllKeysOfUnion<U>>,
    NonCommonKeysOfUnion<U>
>;
