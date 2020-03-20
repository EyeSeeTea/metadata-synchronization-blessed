import _ from "lodash";
import { Identifiable } from "./types";

/* Map sequentially over T[] with an asynchronous function and return array of mapped values */
export function promiseMap<T, S>(inputValues: T[], mapper: (value: T) => Promise<S>): Promise<S[]> {
    const reducer = (acc$: Promise<S[]>, inputValue: T): Promise<S[]> =>
        acc$.then((acc: S[]) =>
            mapper(inputValue).then(result => {
                acc.push(result);
                return acc;
            })
        );
    return inputValues.reduce(reducer, Promise.resolve([]));
}

export function getDuplicatedIds<T extends Identifiable>(oldInstances: T[]): string[] {
    return _(oldInstances)
        .map(instance => instance.id)
        .countBy()
        .pickBy(count => count > 1)
        .keys()
        .value();
}
