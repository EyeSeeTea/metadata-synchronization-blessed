import { MigrationTasks } from "../client/types";

export function getMigrationTasks(): MigrationTasks<MigrationParams> {
    return [
        [1, import("./01.instances-by-id")],
        [2, import("./02.rules-by-id")],
        [3, import("./03.sync-reports")],
        [4, import("./04.history-notifications")],
        [5, import("./05.multiple-stores")],
        [6, import("./06.this-instance")],
    ];
}

export interface MigrationParams {}
