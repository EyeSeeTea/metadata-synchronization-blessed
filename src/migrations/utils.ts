import { Ref } from "d2-api";
import fs from "fs";
import _ from "lodash";
import path from "path";
import { Migration } from "../types/migrations";

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

export function getDuplicatedIds<Obj extends Ref>(objects: Obj[]): string[] {
    return _(objects)
        .map(obj => obj.id)
        .countBy()
        .pickBy(count => count > 1)
        .keys()
        .value();
}

export function getMigrationsForNode(): Migration[] {
    const directory = path.join(__dirname, "tasks");
    const keys = _.sortBy(fs.readdirSync(directory));

    return keys.map(key => {
        const fn = require("./tasks/" + key).default;
        const match = key.match(/(\d+)/);
        if (!match) throw new Error(`Cannot get version from task: ${key}`);
        const version = parseInt(match[1]);
        return { version, fn, name: key };
    });
}

export function getMigrationsForWebpack(): Migration[] {
    const tasks = require.context("./tasks", false, /.*\.ts$/);
    const keys = _.sortBy(tasks.keys());

    return keys.map(key => {
        const match = key.match(/(\d+)/);
        if (!match) throw new Error(`Cannot get version from task: ${key}`);
        const version = parseInt(match[1]);
        const fn = tasks(key).default;
        return { version, fn, name: key };
    });
}
