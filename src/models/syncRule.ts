import _ from "lodash";
import { generateUid } from "d2/uid";

import { deleteData, getDataById, getPaginatedData, saveData } from "./dataStore";
import { D2 } from "../types/d2";
import { SyncRuleTableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import { SynchronizationRule } from "../types/synchronization";
import { Validation } from "../types/validations";
import isValidCronExpression from "../utils/validCronExpression";

const dataStoreKey = "rules";

export default class SyncRule {
    private readonly syncRule: SynchronizationRule;

    constructor(syncRule: SynchronizationRule) {
        this.syncRule = {
            id: generateUid(),
            ..._.pick(syncRule, [
                "id",
                "name",
                "description",
                "builder",
                "enabled",
                "frequency",
                "lastExecuted",
            ]),
        };
    }

    public get name(): string {
        return this.syncRule.name;
    }

    public get description(): string {
        return this.syncRule.description || "";
    }

    public get metadataIds(): string[] {
        return this.syncRule.builder.metadataIds;
    }

    public get targetInstances(): string[] {
        return this.syncRule.builder.targetInstances;
    }

    public get frequency(): string | undefined {
        return this.syncRule.frequency;
    }

    public get enabled(): boolean {
        return this.syncRule.enabled === "true";
    }

    public static create(): SyncRule {
        return new SyncRule({
            id: "",
            name: "",
            description: "",
            builder: {
                targetInstances: [],
                metadataIds: [],
            },
            enabled: "false",
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
        const { targetInstanceFilter = null } = filters || {};
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

    public updateName(name: string): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            name,
        });
    }

    public updateDescription(description: string): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            description,
        });
    }

    public updateMetadataIds(metadataIds: string[]): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                metadataIds,
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

    public updateEnabled(enabled: boolean): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            enabled: enabled.toString(),
        });
    }

    public updateFrequency(frequency: string): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            frequency,
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
            metadataIds: _.compact([
                this.metadataIds.length === 0
                    ? {
                          key: "cannot_be_empty",
                          namespace: { element: "metadata element" },
                      }
                    : null,
            ]),
            targetInstances: _.compact([
                this.targetInstances.length === 0
                    ? {
                          key: "cannot_be_empty",
                          namespace: { element: "instance" },
                      }
                    : null,
            ]),
            frequency: _.compact([
                this.frequency && !isValidCronExpression(this.frequency)
                    ? {
                          key: "cron_expression_must_be_valid",
                          namespace: { expression: "frequency" },
                      }
                    : null,
            ]),
            enabled: _.compact([
                this.enabled && !isValidCronExpression(this.frequency)
                    ? {
                          key: "cannot_enable_without_valid",
                          namespace: { expression: "frequency" },
                      }
                    : null,
            ]),
        });
    }
}
