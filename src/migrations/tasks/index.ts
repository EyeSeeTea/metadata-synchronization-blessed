import { Migration } from "../types";
import Migration01 from "./01.instances-by-id";
import Migration02 from "./02.rules-by-id";
import Migration03 from "./03.sync-reports";
import Migration04 from "./04.history-notifications";
import Migration05 from "./05.multiple-stores";
import Migration06 from "./06.this-instance";

export const migrationTasks: Migration[] = [
    { version: 1, name: "01.instances-by-id", fn: Migration01 },
    { version: 2, name: "02.rules-by-id", fn: Migration02 },
    { version: 3, name: "03.sync-reports", fn: Migration03 },
    { version: 4, name: "04.history-notifications", fn: Migration04 },
    { version: 5, name: "05.multiple-stores", fn: Migration05 },
    { version: 6, name: "06.this-instance", fn: Migration06 },
];
