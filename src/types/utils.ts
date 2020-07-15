export type Maybe<T> = T | undefined | null;
export type Dictionary<T> = Record<string, T>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
