import _ from "lodash";
import { generateUid } from "d2/uid";

import { deleteData, getDataById, getPaginatedData } from "./dataStore";
import { D2 } from "../types/d2";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import { SynchronizationRule } from "../types/synchronization";
import Instance from "./instance";

const dataStoreKey = "rules";

export default class SyncRule {
    private readonly syncRule: SynchronizationRule;

    constructor(syncRule: SynchronizationRule) {
        this.syncRule = {
            id: generateUid(),
            ..._.pick(syncRule, ["id", "name", "description", "originInstance", "builder"]),
        };
    }

    public static create(): SyncRule {
        return new SyncRule({
            id: "",
            name: "",
            originInstance: Instance.create(),
            builder: {
                targetInstances: [],
                metadata: {},
            },
        });
    }

    public static build(syncRule: SynchronizationRule | undefined): SyncRule {
        return syncRule ? new SyncRule(syncRule) : this.create();
    }

    public static async get(d2: D2, id: string): Promise<SyncRule> {
        const data = await getDataById(d2, dataStoreKey, id);
        return this.build(data);
    }

    public static async list(
        d2: D2,
        filters: TableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        return getPaginatedData(d2, dataStoreKey, filters, pagination);
    }

    public async save(_d2: D2): Promise<void> {
        // TODO
    }

    public async remove(d2: D2): Promise<void> {
        await deleteData(d2, dataStoreKey, this.syncRule);
    }
}
