import _ from "lodash";
import { generateUid } from "d2/uid";

import { deleteData, getDataById, getPaginatedData, saveData } from "./dataStore";
import { D2 } from "../types/d2";
import { SyncRuleTableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import { MetadataPackage, SynchronizationRule } from "../types/synchronization";
import { Validation } from "../types/validations";

const dataStoreKey = "rules";

export default class SyncRule {
    private readonly syncRule: SynchronizationRule;

    constructor(syncRule: SynchronizationRule) {
        this.syncRule = {
            id: generateUid(),
            ..._.pick(syncRule, ["id", "name", "description", "originInstance", "builder"]),
        };
    }

    public get name(): string {
        return this.syncRule.name;
    }

    public set name(name: string) {
        this.syncRule.name = name;
    }

    public get description(): string {
        return this.syncRule.description || "";
    }

    public set description(description: string) {
        this.syncRule.description = description;
    }

    public get metadata(): MetadataPackage {
        return this.syncRule.builder.metadata || {};
    }

    public get selectedIds(): string[] {
        return (
            _(this.syncRule.builder.metadata)
                .values()
                .flatten()
                .value() || []
        );
    }

    public get targetInstances(): string[] {
        return this.syncRule.builder.targetInstances;
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
        filters: SyncRuleTableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        const { targetInstanceFilter } = filters;
        const data = await getPaginatedData(d2, dataStoreKey, filters, pagination);
        return targetInstanceFilter
            ? {
                  ...data,
                  objects: _.filter(data.objects, e =>
                      e.builder.targetInstances.includes(targetInstanceFilter)
                  ),
              }
            : data;
    }

    public addMetadataIds(type: string, ids: string[]): SyncRule {
        const original = this.syncRule.builder.metadata[type] || [];
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                metadata: {
                    ...this.syncRule.builder.metadata,
                    [type]: [...original, ...ids],
                },
            },
        });
    }

    public removeMetadataIds(ids: string[]): SyncRule {
        const metadata = _(this.syncRule.builder.metadata)
            .mapValues(idsForType => _.difference(idsForType, ids))
            .value();
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                metadata,
            },
        });
    }

    public updateTargetInstances(targetInstances: string[]): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                targetInstances,
            },
        });
    }

    public async save(d2: D2): Promise<void> {
        const exists = !!this.syncRule.id;
        const element = exists ? this.syncRule : { ...this.syncRule, id: generateUid() };

        if (exists) await this.remove(d2);
        await saveData(d2, dataStoreKey, element);
    }

    public async remove(d2: D2): Promise<void> {
        await deleteData(d2, dataStoreKey, this.syncRule);
    }

    public async validate(): Promise<Validation> {
        return _.pickBy({
            name: _.compact([
                !this.name.trim()
                    ? {
                          key: "cannot_be_blank",
                          namespace: { field: "name" },
                      }
                    : null,
            ]),
            selectedIds: _.compact([
                this.selectedIds.length === 0
                    ? {
                          key: "cannot_be_empty",
                          namespace: {},
                      }
                    : null,
            ]),
            targetInstances: _.compact([
                this.targetInstances.length === 0
                    ? {
                          key: "cannot_be_empty",
                          namespace: {},
                      }
                    : null,
            ]),
        });
    }
}
