import { Ref } from "d2-api";
import fs from "fs";
import _ from "lodash";
import path from "path";
import { Migration } from "../types/migrations";

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
