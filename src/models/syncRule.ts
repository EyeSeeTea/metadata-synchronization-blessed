import _ from "lodash";
import { generateUid } from "d2/uid";

import { deleteData, getDataById, getPaginatedData, saveData } from "./dataStore";
import { D2 } from "../types/d2";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import { MetadataPackage, SynchronizationRule } from "../types/synchronization";

const dataStoreKey = "rules";

export default class SyncRule {
    private readonly _syncRule: SynchronizationRule;
    private _selectedIds: string[];

    constructor(syncRule: SynchronizationRule) {
        this._selectedIds = [];
        this._syncRule = {
            id: generateUid(),
            ..._.pick(syncRule, ["id", "name", "description", "originInstance", "builder"]),
        };
    }

    public static create(): SyncRule {
        return new SyncRule({
            id: "",
            name: "",
            description: "",
            originInstance: "",
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

    public set targetInstances(instances: string[]) {
        this._syncRule.builder.targetInstances = instances;
    }

    public get targetInstances(): string[] {
        return this._syncRule.builder.targetInstances;
    }

    public set name(name: string) {
        this._syncRule.name = name;
    }

    public get name(): string {
        return this._syncRule.name;
    }

    public get description(): string {
        return this._syncRule.description || "";
    }

    public set description(description: string) {
        this._syncRule.description = description;
    }

    public get metadata(): MetadataPackage {
        return this._syncRule.builder.metadata || {};
    }

    public set metadata(metadata: MetadataPackage) {
        this._syncRule.builder.metadata = metadata;
    }

    public get selectedIds(): string[] {
        return this._selectedIds;
    }

    public set selectedIds(value: string[]) {
        this._selectedIds = value;
    }

    public async save(d2: D2): Promise<void> {
        const exists = this._syncRule.id;
        const element = exists ? this._syncRule : { ...this._syncRule, id: generateUid() };

        if (exists) await this.remove(d2);
        await saveData(d2, dataStoreKey, element);
    }

    public async remove(d2: D2): Promise<void> {
        await deleteData(d2, dataStoreKey, this._syncRule);
    }
}
