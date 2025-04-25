/**
 * Wrap a collection of values, expanding methods for Javascript Arrays. An example:
 *
 * ```
 * import _ from "./Collection";
 *
 * const values = _(["1", "2", "3", "3", "4"])
 *     .map(x => parseInt(x))
 *     .filter(x => x > 1)
 *     .uniq()
 *     .reverse()
 *     .value(); // [4, 3, 2]
 * ```
 */

import { HashMap } from "./HashMap";

export class Collection<T> {
    protected xs: T[];

    protected constructor(values: T[]) {
        this.xs = values;
    }

    /* Builders */

    static from<T>(xs: T[]): Collection<T> {
        return new Collection(xs);
    }

    static range(start: number, end: number, step = 1): Collection<number> {
        const output = [];
        for (let idx = start; idx < end; idx = idx + step) output.push(idx);
        return Collection.from(output);
    }

    /* Unwrappers */

    value(): T[] {
        return this.xs;
    }

    toArray = this.value;

    get size() {
        return this.xs.length;
    }

    /* Methods that return a Collection */

    map<U>(fn: (x: T) => U): Collection<U> {
        return _c(this.xs.map(fn));
    }

    flatten(): T extends Array<infer U> ? Collection<U> : never {
        return _c(this.xs.flat()) as any;
    }

    flatMap<U>(fn: (x: T) => Collection<U>): Collection<U> {
        return _c(this.xs.flatMap(x => fn(x).toArray()));
    }

    select(pred: (x: T) => boolean): Collection<T> {
        return _c(this.xs.filter(pred));
    }

    filter = this.select;

    reject(pred: (x: T) => boolean): Collection<T> {
        return _c(this.xs.filter(x => !pred(x)));
    }

    enumerate(): Collection<[number, T]> {
        return _c(this.xs.map((x, idx) => [idx, x]));
    }

    compact(): Collection<NonNullable<T>> {
        return this.reject(x => x === undefined || x === null) as unknown as Collection<NonNullable<T>>;
    }

    compactMap<U>(fn: (x: T) => U | undefined | null): Collection<U> {
        return this.map(fn).compact() as unknown as Collection<U>;
    }

    append(x: T): Collection<T> {
        return _c(this.xs.concat([x]));
    }

    includes(x: T): boolean {
        return this.xs.includes(x);
    }

    every(pred: (x: T) => boolean): boolean {
        return this.xs.every(pred);
    }

    all = this.every;

    some(pred: (x: T) => boolean): boolean {
        return this.xs.some(pred);
    }

    any = this.some;

    find<Or extends T | undefined>(pred: (x: T) => boolean, options: { or?: Or } = {}): T | Or {
        return this.xs.find(pred) || (options?.or as Or);
    }

    sort(): Collection<T> {
        return this.sortWith(defaultCompareFn);
    }

    reverse(): Collection<T> {
        return _c([...this.xs].reverse());
    }

    sortWith(compareFn: CompareFn<T>): Collection<T> {
        return _c(this.xs.slice().sort(compareFn));
    }

    sortBy<U>(fn: (x: T) => U, options: { compareFn?: CompareFn<U> } = {}): Collection<T> {
        const compareFn = options.compareFn || defaultCompareFn;
        // TODO: Schwartzian transform: decorate + sort tuple + undecorate
        return this.sortWith((a, b) => compareFn(fn(a), fn(b)));
    }

    orderBy(items: OrderItem<T>[]): Collection<T> {
        return this.sortWith((a, b) => {
            return compareArray(a, b, items);
        });
    }

    first(): T | undefined {
        return this.xs[0];
    }

    last(): T | undefined {
        return this.xs[this.xs.length - 1];
    }

    sum(): number {
        return this.xs.reduce((acc, x) => acc + Number(x), 0);
    }

    take(n: number): Collection<T> {
        return _c(this.xs.slice(0, n));
    }

    drop(n: number): Collection<T> {
        return _c(this.xs.slice(n));
    }

    pairwise(): Collection<[T, T]> {
        const n = 2;

        return _c(
            this.xs.slice(0, this.xs.length - n + 1).map((_x, idx) => [this.xs[idx], this.xs[idx + 1]] as [T, T])
        );
    }

    prepend(x: T) {
        return _c([x, ...this.xs]);
    }

    tap(fn: (xs: Collection<T>) => void) {
        fn(this);
        return this;
    }

    splitAt(indexes: number[]): Collection<Collection<T>> {
        return _c(indexes)
            .prepend(0)
            .append(this.xs.length)
            .pairwise()
            .map(([i1, i2]) => _c(this.xs.slice(i1, i2)));
    }

    thru<U>(fn: (xs: Collection<T>) => Collection<U>) {
        return fn(this);
    }

    join(char: string): string {
        return this.xs.join(char);
    }

    get(idx: number): T | undefined {
        return this.xs[idx];
    }

    getMany(idxs: number[]): Collection<T | undefined> {
        return _c(idxs.map(idx => this.xs[idx]));
    }

    intersperse(value: T): Collection<T> {
        return this.flatMap(x => _c([x, value])).thru(cs => cs.take(cs.size - 1));
    }

    uniq(): Collection<T> {
        return this.uniqBy(x => x);
    }

    uniqBy<U>(mapper: (value: T) => U): Collection<T> {
        const seen = new Set<U>();
        const output: Array<T> = [];

        for (const item of this.xs) {
            const mapped = mapper(item);
            if (!seen.has(mapped)) {
                output.push(item);
                seen.add(mapped);
            }
        }

        return _c(output);
    }

    reduce<U>(mapper: (acc: U, value: T) => U, initialAcc: U): U {
        return this.xs.reduce(mapper, initialAcc);
    }

    chunk(size: number): Collection<T[]> {
        return Collection.range(0, this.xs.length, size).map(index => {
            return this.xs.slice(index, index + size);
        });
    }

    cartesian(): T extends Array<infer U> ? Collection<U[]> : never {
        const [ys, ...zss] = this.xs;

        if (!ys) {
            return _c([[]]) as any;
        } else {
            return _c(ys as unknown as T[]).flatMap(x =>
                _c(zss)
                    .cartesian()
                    .map(zs => [x, ...zs])
            ) as any;
        }
    }

    // forEach(fn: (value: T) => void): void

    zipLongest<S>(xs: Collection<S>): Collection<[T | undefined, S | undefined]> {
        const max = Math.max(this.size, xs.size);
        const pairs = Collection.range(0, max)
            .map(i => [this.xs[i], xs.xs[i]] as [T | undefined, S | undefined])
            .value();
        return _c(pairs);
    }

    zip<S>(xs: Collection<S>): Collection<[T, S]> {
        const min = Math.min(this.size, xs.size);
        const pairs = Collection.range(0, min)
            .map(i => [this.xs[i], xs.xs[i]] as [T, S])
            .value();
        return _c(pairs);
    }

    /* Methods that return HashMap */

    indexBy<U>(grouperFn: (x: T) => U): HashMap<U, T> {
        const initialValue = HashMap.empty<U, T>();

        return this.reduce((acc, x) => {
            const key = grouperFn(x);
            return acc.set(key, x);
        }, initialValue);
    }

    keyBy = this.indexBy;

    groupBy<U>(grouperFn: (x: T) => U): HashMap<U, T[]> {
        const map = this.reduce((acc, value) => {
            const key = grouperFn(value);
            const valuesForKey = acc.get(key) || [];
            valuesForKey.push(value);
            return acc.set(key, valuesForKey);
        }, new Map<U, T[]>());

        return HashMap.fromPairs(Array.from(map.entries()));
    }

    groupFromMap<U, W>(pairGrouperFn: (x: T) => [U, W]): HashMap<U, W[]> {
        const map = this.reduce((acc, x) => {
            const [key, value] = pairGrouperFn(x);
            const valuesForKey = acc.get(key) || [];
            valuesForKey.push(value);
            return acc.set(key, valuesForKey);
        }, new Map<U, W[]>());

        return HashMap.fromPairs(Array.from(map.entries()));
    }

    toHashMap<K, V>(toPairFn: (x: T) => [K, V]): HashMap<K, V> {
        const pairs = this.map(toPairFn).toArray();
        return HashMap.fromPairs(pairs);
    }
}

type CompareRes = -1 | 0 | 1;

type CompareFn<T> = (a: T, b: T) => CompareRes;

type Direction = "asc" | "desc";

function defaultCompareFn<T>(a: T, b: T, direction: Direction = "asc"): CompareRes {
    const [value1, value2] = direction === "asc" ? [1 as const, -1 as const] : [-1 as const, 1 as const];
    return a > b ? value1 : b > a ? value2 : 0;
}

function compareArray<T>(a: T, b: T, items: OrderItem<T>[]): CompareRes {
    const item = items[0];
    if (!item) return 0;
    const [mapper, direction] = item;
    const res = defaultCompareFn(mapper(a), mapper(b), direction);
    return res !== 0 ? res : compareArray(a, b, items.slice(1));
}

type OrderItem<T> = [(obj: T) => unknown, "asc" | "desc"];

export default function _c<T>(xs: T[]): Collection<T> {
    return Collection.from(xs);
}
