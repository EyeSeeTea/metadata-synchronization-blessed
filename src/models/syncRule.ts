import cronstrue from "cronstrue";
import { generateUid } from "d2/uid";
import _ from "lodash";
import moment from "moment";
import { D2 } from "../types/d2";
import { SyncRuleTableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import {
    DataSynchronizationParams,
    DataSyncPeriod,
    MetadataSynchronizationParams,
    SharingSetting,
    SynchronizationRule,
    SyncRuleType,
} from "../types/synchronization";
import { Validation } from "../types/validations";
import { getUserInfo, isGlobalAdmin, UserInfo } from "../utils/permissions";
import isValidCronExpression from "../utils/validCronExpression";
import { deleteData, getDataById, getPaginatedData, saveData } from "./dataStore";

const dataStoreKey = "rules";

export default class SyncRule {
    private readonly syncRule: SynchronizationRule;

    constructor(syncRule: SynchronizationRule) {
        this.syncRule = {
            id: generateUid(),
            ..._.pick(syncRule, [
                "id",
                "name",
                "code",
                "created",
                "description",
                "builder",
                "enabled",
                "frequency",
                "lastExecuted",
                "lastUpdated",
                "lastUpdatedBy",
                "publicAccess",
                "user",
                "userAccesses",
                "userGroupAccesses",
                "type",
            ]),
        };
    }

    public replicate(): SyncRule {
        return this.updateName(`Copy of ${this.syncRule.name}`).updateId(generateUid());
    }

    public get id(): string {
        return this.syncRule.id ?? "";
    }

    public get name(): string {
        return this.syncRule.name ?? "";
    }

    public get type(): SyncRuleType {
        return this.syncRule.type || "metadata";
    }

    public get code(): string | undefined {
        return this.syncRule.code;
    }

    public get description(): string | undefined {
        return this.syncRule.description;
    }

    public get metadataIds(): string[] {
        return this.syncRule.builder.metadataIds ?? [];
    }

    public get excludedIds(): string[] {
        return this.syncRule.builder.excludedIds ?? [];
    }

    public get dataSyncAttributeCategoryOptions(): string[] {
        return this.syncRule.builder.dataParams?.attributeCategoryOptions ?? [];
    }

    public get dataSyncAllAttributeCategoryOptions(): boolean {
        return this.syncRule.builder.dataParams?.allAttributeCategoryOptions ?? false;
    }

    public get dataSyncOrgUnitPaths(): string[] {
        return this.syncRule.builder.dataParams?.orgUnitPaths ?? [];
    }

    public get dataSyncPeriod(): DataSyncPeriod {
        return this.syncRule.builder.dataParams?.period ?? "ALL";
    }

    public get dataSyncStartDate(): Date | null {
        return this.syncRule.builder.dataParams?.startDate ?? null;
    }

    public get dataSyncEndDate(): Date | null {
        return this.syncRule.builder.dataParams?.endDate ?? null;
    }

    public get dataSyncEvents(): string[] {
        return this.syncRule.builder.dataParams?.events ?? [];
    }

    public get dataSyncAllEvents(): boolean {
        return this.syncRule.builder.dataParams?.allEvents ?? false;
    }

    public get targetInstances(): string[] {
        return this.syncRule.builder.targetInstances ?? [];
    }

    public get enabled(): boolean {
        return this.syncRule.enabled ?? false;
    }

    public get frequency(): string | undefined {
        return this.syncRule.frequency;
    }

    public get lastExecuted(): Date | undefined {
        return this.syncRule.lastExecuted ? new Date(this.syncRule.lastExecuted) : undefined;
    }

    public get readableFrequency(): string | undefined {
        const { frequency } = this.syncRule;
        return frequency && isValidCronExpression(frequency)
            ? cronstrue.toString(frequency)
            : undefined;
    }

    public get longFrequency(): string | undefined {
        const { frequency } = this.syncRule;
        return frequency && isValidCronExpression(frequency)
            ? `${cronstrue.toString(frequency)} (${frequency})`
            : undefined;
    }

    public get publicAccess(): string {
        return this.syncRule.publicAccess ?? "--------";
    }

    public get userAccesses(): SharingSetting[] {
        return this.syncRule.userAccesses ?? [];
    }

    public get userGroupAccesses(): SharingSetting[] {
        return this.syncRule.userGroupAccesses ?? [];
    }

    public get syncParams(): MetadataSynchronizationParams {
        return this.syncRule.builder.syncParams ?? {};
    }

    public get dataParams(): DataSynchronizationParams {
        return this.syncRule.builder.dataParams ?? {};
    }

    public static create(type: SyncRuleType = "metadata"): SyncRule {
        return new SyncRule({
            id: "",
            name: "",
            code: "",
            created: new Date(),
            description: "",
            type: type,
            builder: {
                targetInstances: [],
                metadataIds: [],
                excludedIds: [],
                dataParams: {
                    strategy: "NEW_AND_UPDATES",
                    allAttributeCategoryOptions: true,
                },
                syncParams: {
                    importStrategy: "CREATE_AND_UPDATE",
                    includeSharingSettings: true,
                    atomicMode: "ALL",
                    mergeMode: "MERGE",
                },
            },
            enabled: false,
            lastUpdated: new Date(),
            lastUpdatedBy: {
                id: "",
                name: "",
            },
            publicAccess: "rw------",
            user: {
                id: "",
                name: "",
            },
            userAccesses: [],
            userGroupAccesses: [],
        });
    }

    public static createOnDemand(type: SyncRuleType = "metadata"): SyncRule {
        return SyncRule.create(type).updateName("__MANUAL__");
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
        const {
            targetInstanceFilter = null,
            enabledFilter = null,
            lastExecutedFilter = null,
            type = "metadata",
        } = filters || {};
        const { page = 1, pageSize = 20, paging = true, sorting } = pagination || {};

        const globalAdmin = await isGlobalAdmin(d2);
        const userInfo = await getUserInfo(d2);

        const data = await getPaginatedData(d2, dataStoreKey, filters, { paging: false, sorting });
        const filteredObjects = _(data.objects)
            .filter(data => {
                const rule = SyncRule.build(data);
                return rule.type === type;
            })
            .filter(data => {
                const rule = SyncRule.build(data);
                return globalAdmin || rule.isVisibleToUser(userInfo);
            })
            .filter(rule =>
                targetInstanceFilter
                    ? rule.builder.targetInstances.includes(targetInstanceFilter)
                    : true
            )
            .filter(rule => (enabledFilter ? rule.enabled && enabledFilter === "enabled" : true))
            .filter(rule =>
                lastExecutedFilter && rule.lastExecuted
                    ? moment(lastExecutedFilter).isSameOrBefore(rule.lastExecuted, "date")
                    : true
            )
            .value();

        const total = filteredObjects.length;
        const pageCount = paging ? Math.ceil(filteredObjects.length / pageSize) : 1;
        const firstItem = paging ? (page - 1) * pageSize : 0;
        const lastItem = paging ? firstItem + pageSize : total;
        const objects = _.slice(filteredObjects, firstItem, lastItem);

        return { objects, pager: { page, pageCount, total } };
    }

    public toBuilder() {
        return _.pick(this, [
            "metadataIds",
            "excludedIds",
            "targetInstances",
            "syncParams",
            "dataParams",
        ]);
    }

    public updateId(id: string): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            id,
        });
    }

    public updateName(name: string): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            name,
        });
    }

    public updateCode(code: string): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            code,
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

    public updateExcludedIds(excludedIds: string[]): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                excludedIds,
            },
        });
    }

    public updateDataSyncAttributeCategoryOptions(attributeCategoryOptions?: string[]): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                dataParams: {
                    ...this.syncRule.builder.dataParams,
                    attributeCategoryOptions,
                },
            },
        });
    }

    public updateDataSyncAllAttributeCategoryOptions(
        allAttributeCategoryOptions?: boolean
    ): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                dataParams: {
                    ...this.syncRule.builder.dataParams,
                    allAttributeCategoryOptions,
                },
            },
        });
    }

    public updateDataSyncOrgUnitPaths(orgUnitPaths: string[]): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                dataParams: {
                    ...this.syncRule.builder.dataParams,
                    orgUnitPaths,
                },
            },
        });
    }

    public updateDataSyncPeriod(period?: DataSyncPeriod): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                dataParams: {
                    ...this.syncRule.builder.dataParams,
                    period,
                },
            },
        });
    }

    public updateDataSyncStartDate(startDate?: Date): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                dataParams: {
                    ...this.syncRule.builder.dataParams,
                    startDate,
                },
            },
        });
    }

    public updateDataSyncEndDate(endDate?: Date): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                dataParams: {
                    ...this.syncRule.builder.dataParams,
                    endDate,
                },
            },
        });
    }

    public updateDataSyncEvents(events?: string[]): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                dataParams: {
                    ...this.syncRule.builder.dataParams,
                    events,
                },
            },
        });
    }

    public updateDataSyncAllEvents(allEvents?: boolean): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                dataParams: {
                    ...this.syncRule.builder.dataParams,
                    allEvents,
                },
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

    public updateSyncParams(syncParams: MetadataSynchronizationParams): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                syncParams,
            },
        });
    }

    public updateDataParams(dataParams: DataSynchronizationParams): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                dataParams,
            },
        });
    }

    public updateEnabled(enabled: boolean): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            enabled,
        });
    }

    public updateFrequency(frequency: string): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            frequency,
        });
    }

    public updateLastExecuted(lastExecuted: Date): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            lastExecuted,
        });
    }

    public isOnDemand() {
        return this.name === "__MANUAL__";
    }

    public isVisibleToUser(userInfo: UserInfo, permission: "READ" | "WRITE" = "READ") {
        const { id: userId, userGroups } = userInfo;
        const token = permission === "READ" ? "r" : "w";
        const {
            publicAccess = "--------",
            userAccesses = [],
            userGroupAccesses = [],
        } = this.syncRule;

        const isUserOwner = this.syncRule.user ? this.syncRule.user.id === userId : false;
        const isPublic = publicAccess.substring(0, 2).includes(token);
        const hasUserAccess = !!_(userAccesses)
            .filter(({ access }) => access.substring(0, 2).includes(token))
            .find(({ id }) => id === userId);
        const hasGroupAccess =
            _(userGroupAccesses)
                .filter(({ access }) => access.substring(0, 2).includes(token))
                .intersectionBy(userGroups, "id")
                .value().length > 0;

        return isUserOwner || isPublic || hasUserAccess || hasGroupAccess;
    }

    public async save(d2: D2): Promise<void> {
        const userInfo = await getUserInfo(d2);
        const user = _.pick(userInfo, ["id", "name"]);
        const exists = !!this.syncRule.id;
        const element = exists
            ? this.syncRule
            : { ...this.syncRule, id: generateUid(), created: new Date(), user };

        if (exists) await this.remove(d2);
        await saveData(d2, dataStoreKey, {
            ...element,
            lastUpdated: new Date(),
            lastUpdatedBy: user,
        });
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
            dataSyncOrganisationUnits: _.compact([
                this.type !== "metadata" && this.dataSyncOrgUnitPaths.length === 0
                    ? {
                          key: "cannot_be_empty",
                          namespace: { element: "organisation unit" },
                      }
                    : null,
            ]),
            dataSyncStartDate: _.compact([
                this.dataSyncPeriod === "FIXED" && !this.dataSyncStartDate
                    ? {
                          key: "cannot_be_empty",
                          namespace: { element: "start date" },
                      }
                    : null,
            ]),
            dataSyncEndDate: _.compact([
                this.dataSyncPeriod === "FIXED" && !this.dataSyncEndDate
                    ? {
                          key: "cannot_be_empty",
                          namespace: { element: "end date" },
                      }
                    : null,
                this.dataSyncPeriod === "FIXED" &&
                this.dataSyncEndDate &&
                this.dataSyncStartDate &&
                moment(this.dataSyncEndDate).isBefore(this.dataSyncStartDate)
                    ? {
                          key: "invalid_period",
                          namespace: {},
                      }
                    : null,
            ]),
            dataSyncEvents: _.compact([
                this.type === "events" &&
                !this.dataSyncAllEvents &&
                this.dataSyncEvents.length === 0
                    ? {
                          key: "cannot_be_empty",
                          namespace: { element: "event" },
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

    public async isValid(): Promise<boolean> {
        const validation = await this.validate();
        return _.flatten(Object.values(validation)).length === 0;
    }
}
