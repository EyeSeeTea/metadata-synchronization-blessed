import * as rcpromise from "real-cancellable-promise";
import { Cancellation } from "real-cancellable-promise";

/**
 * Futures are async values similar to promises, with some differences:
 *   - Futures are only executed when their method `run` is called.
 *   - Futures are cancellable (thus, they can be easily used in a `React.useEffect`, for example).
 *   - Futures have fully typed errors. Subclass Error if you need full stack traces.
 *   - You may still use async/await monad-style blocks (check Future.block).
 *
 * More info: https://github.com/EyeSeeTea/know-how/wiki/Async-futures
 */

/**
 * @description Future is refactored
 */
export class Future<E, D> {
    private constructor(private _promise: () => rcpromise.CancellablePromise<D>) {}

    static success<E, D>(data: D): Future<E, D> {
        return new Future(() => rcpromise.CancellablePromise.resolve(data));
    }

    static error<E, D>(error: E): Future<E, D> {
        return new Future(() => rcpromise.CancellablePromise.reject(error));
    }

    static fromComputation<E, D>(
        computation: (resolve: (value: D) => void, reject: (error: E) => void) => Cancel
    ): Future<E, D> {
        let cancel: Cancel = () => {};

        return new Future(() => {
            const promise = new Promise<D>((resolve, reject) => {
                cancel = computation(resolve, error => reject(error));
            });

            return new rcpromise.CancellablePromise(promise, cancel || (() => {}));
        });
    }

    static fromPromise<Data>(promise: Promise<Data>): FutureData<Data> {
        return Future.fromComputation((resolve, reject) => {
            promise.then(resolve).catch(err => reject(err ? err.message : "Unknown error"));
            return () => {};
        });
    }

    run(onSuccess: (data: D) => void, onError: (error: E) => void): Cancel {
        return this._promise().then(onSuccess, err => {
            if (err instanceof rcpromise.Cancellation) {
                // no-op
            } else {
                onError(err);
            }
        }).cancel;
    }

    map<U>(fn: (data: D) => U): Future<E, U> {
        return new Future(() => this._promise().then(fn));
    }

    mapError<E2>(fn: (error: E) => E2): Future<E2, D> {
        return new Future(() =>
            this._promise().catch((error: E) => {
                throw fn(error);
            })
        );
    }

    flatMap<U, E>(fn: (data: D) => Future<U, E>): Future<U, E> {
        return new Future(() => this._promise().then(data => fn(data)._promise()));
    }

    chain<U, E>(fn: (data: D) => Future<U, E>): Future<U, E> {
        return this.flatMap(fn);
    }

    toPromise(): Promise<D> {
        return this._promise();
    }

    static join2<E, T, S>(async1: Future<E, T>, async2: Future<E, S>): Future<E, [T, S]> {
        return new Future(() => {
            return rcpromise.CancellablePromise.all<T, S>([async1._promise(), async2._promise()]);
        });
    }

    static joinObj<Obj extends Record<string, Future<any, any>>>(
        obj: Obj,
        options: ParallelOptions = { concurrency: 1 }
    ): Future<
        Obj[keyof Obj] extends Future<infer E, any> ? E : never,
        { [K in keyof Obj]: Obj[K] extends Future<any, infer U> ? U : never }
    > {
        const asyncs = Object.values(obj);

        return Future.parallel(asyncs, options).map(values => {
            const keys = Object.keys(obj);
            const pairs = keys.map((key, idx) => [key, values[idx]]);
            return Object.fromEntries(pairs);
        });
    }

    static sequential<E, D>(asyncs: Future<E, D>[]): Future<E, D[]> {
        return Future.block(async $ => {
            const output: D[] = [];
            for (const async of asyncs) {
                const res = await $(async);
                output.push(res);
            }
            return output;
        });
    }

    static parallel<E, D>(asyncs: Future<E, D>[], options: ParallelOptions): Future<E, D[]> {
        return new Future(() =>
            rcpromise.buildCancellablePromise(async $ => {
                const queue: rcpromise.CancellablePromise<void>[] = [];
                const output: D[] = new Array(asyncs.length);

                for (const [idx, async] of asyncs.entries()) {
                    const queueItem$ = async._promise().then(res => {
                        queue.splice(queue.indexOf(queueItem$), 1);
                        output[idx] = res;
                    });

                    queue.push(queueItem$);

                    if (queue.length >= options.concurrency) await $(rcpromise.CancellablePromise.race(queue));
                }

                await $(rcpromise.CancellablePromise.all(queue));
                return output;
            })
        );
    }

    static sleep(ms: number): Future<any, number> {
        return new Future(() => rcpromise.CancellablePromise.delay(ms)).map(() => ms);
    }

    static void(): Future<unknown, undefined> {
        return Future.success(undefined);
    }

    static block<E, U>(blockFn: (capture: CaptureAsync<E>) => Promise<U>): Future<E, U> {
        return new Future((): rcpromise.CancellablePromise<U> => {
            return rcpromise.buildCancellablePromise(capturePromise => {
                const captureAsync: CaptureAsync<E> = async => {
                    return capturePromise(async._promise());
                };

                captureAsync.throw = function (error: E) {
                    throw error;
                };

                return blockFn(captureAsync);
            });
        });
    }

    static block_<E>() {
        return function <U>(blockFn: (capture: CaptureAsync<E>) => Promise<U>): Future<E, U> {
            return Future.block<E, U>(blockFn);
        };
    }
}

export type Cancel = (() => void) | undefined;

interface CaptureAsync<E> {
    <D>(async: Future<E, D>): Promise<D>;
    throw: (error: E) => never;
}

type ParallelOptions = { concurrency: number };

export function getJSON<U>(url: string): Future<TypeError | SyntaxError, U> {
    const abortController = new AbortController();

    return Future.fromComputation((resolve, reject) => {
        // exceptions: TypeError | DOMException[name=AbortError]
        fetch(url, { method: "get", signal: abortController.signal })
            .then(res => res.json() as unknown as U) // exceptions: SyntaxError
            .then(data => resolve(data))
            .catch((error: unknown) => {
                if (isNamedError(error) && error.name === "AbortError") {
                    throw new Cancellation();
                } else if (error instanceof TypeError || error instanceof SyntaxError) {
                    reject(error);
                } else {
                    reject(new TypeError("Unknown error"));
                }
            });

        return () => abortController.abort();
    });
}

function isNamedError(error: unknown): error is { name: string } {
    return Boolean(error && typeof error === "object" && "name" in error);
}

export type FutureData<D> = Future<Error, D>;
