import cronstrue from "cronstrue";
import { generateUid } from "d2/uid";
import _ from "lodash";
import moment from "moment";
import {
    DataSyncAggregation,
    DataSynchronizationParams,
    DataSyncPeriod,
} from "../domain/aggregated/types";
import { SharingSetting } from "../domain/common/entities/SharingSetting";
import { SynchronizationRule } from "../domain/synchronization/entities/SynchronizationRule";
import { SynchronizationType } from "../domain/synchronization/entities/SynchronizationType";
import { D2Api, Ref } from "../types/d2-api";
import { SyncRuleTableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import {
    ExcludeIncludeRules,
    MetadataIncludeExcludeRules,
    MetadataSynchronizationParams,
    SynchronizationBuilder,
} from "../types/synchronization";
import { extractChildrenFromRules, extractParentsFromRule } from "../utils/metadataIncludeExclude";
import { getUserInfo, isGlobalAdmin, UserInfo } from "../utils/permissions";
import { OldValidation } from "../utils/old-validations";
import isValidCronExpression from "../utils/validCronExpression";
import {
    deleteData,
    deleteDataStore,
    getDataById,
    getDataStore,
    getPaginatedData,
    saveData,
    saveDataStore,
} from "./dataStore";
import { D2Model } from "./dhis/default";
import { FilterRule } from "../domain/metadata/entities/FilterRule";

const dataStoreKey = "rules";

const defaultSynchronizationBuilder: SynchronizationBuilder = {
    originInstance: "LOCAL",
    targetInstances: [],
    metadataIds: [],
    filterRules: [],
    excludedIds: [],
    metadataTypes: [],
    dataParams: {
        strategy: "NEW_AND_UPDATES",
        allAttributeCategoryOptions: true,
        dryRun: false,
        allEvents: true,
        enableAggregation: undefined,
        aggregationType: undefined,
    },
    syncParams: {
        importStrategy: "CREATE_AND_UPDATE",
        enableMapping: false,
        includeSharingSettings: true,
        removeOrgUnitReferences: false,
        useDefaultIncludeExclude: true,
        atomicMode: "ALL",
        mergeMode: "MERGE",
        importMode: "COMMIT",
    },
};

type DetailsKeys = "builder";

type SynchronizationRuleMain = Omit<SynchronizationRule, "builder"> &
    Pick<SynchronizationBuilder, "targetInstances">;

type SynchronizationRuleDetails = Pick<SynchronizationRule, DetailsKeys>;

export default class SyncRule {
    private readonly syncRule: SynchronizationRule;

    constructor(syncRule: SynchronizationRule) {
        this.syncRule = _.pick(syncRule, [
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
        ]);

        if (!this.syncRule.id) this.syncRule.id = generateUid();
    }

    public replicate(): SyncRule {
        return this.updateName(`Copy of ${this.syncRule.name}`)
            .update({ lastExecuted: undefined })
            .updateId(generateUid());
    }

    public toObject(): SynchronizationRule {
        return _.clone(this.syncRule);
    }

    public get id(): string {
        return this.syncRule.id ?? "";
    }

    public get name(): string {
        return this.syncRule.name ?? "";
    }

    public get type(): SynchronizationType {
        return this.syncRule.type || "metadata";
    }

    public get code(): string | undefined {
        return this.syncRule.code;
    }

    public get description(): string | undefined {
        return this.syncRule.description;
    }

    public get originInstance(): string {
        return this.syncRule.builder?.originInstance ?? "LOCAL";
    }

    public get builder(): SynchronizationBuilder {
        return this.syncRule.builder ?? defaultSynchronizationBuilder;
    }

    public get metadataIds(): string[] {
        return this.syncRule.builder?.metadataIds ?? [];
    }

    public get excludedIds(): string[] {
        return this.syncRule.builder?.excludedIds ?? [];
    }

    public get filterRules(): FilterRule[] {
        return this.syncRule.builder?.filterRules ?? [];
    }

    public get metadataTypes(): string[] {
        return this.syncRule.builder?.metadataTypes ?? [];
    }

    public get dataSyncAttributeCategoryOptions(): string[] {
        return this.syncRule.builder?.dataParams?.attributeCategoryOptions ?? [];
    }

    public get dataSyncAllAttributeCategoryOptions(): boolean {
        return this.syncRule.builder?.dataParams?.allAttributeCategoryOptions ?? false;
    }

    public get dataSyncOrgUnitPaths(): string[] {
        return this.syncRule.builder?.dataParams?.orgUnitPaths ?? [];
    }

    public get dataSyncPeriod(): DataSyncPeriod {
        return this.syncRule.builder?.dataParams?.period ?? "ALL";
    }

    public get dataSyncStartDate(): Date | null {
        return this.syncRule.builder?.dataParams?.startDate ?? null;
    }

    public get dataSyncEndDate(): Date | null {
        return this.syncRule.builder?.dataParams?.endDate ?? null;
    }

    public get dataSyncEvents(): string[] {
        return this.syncRule.builder?.dataParams?.events ?? [];
    }

    public get dataSyncAllEvents(): boolean {
        return this.syncRule.builder?.dataParams?.allEvents ?? true;
    }

    public get dataSyncEnableAggregation(): boolean | undefined {
        return this.syncRule.builder?.dataParams?.enableAggregation;
    }

    public get dataSyncAggregationType(): DataSyncAggregation | undefined {
        return this.syncRule.builder?.dataParams?.aggregationType;
    }

    public get useDefaultIncludeExclude(): boolean {
        return this.syncRule.builder?.syncParams?.useDefaultIncludeExclude ?? true;
    }

    public get metadataIncludeExcludeRules(): MetadataIncludeExcludeRules {
        return this.syncRule.builder?.syncParams?.metadataIncludeExcludeRules ?? {};
    }

    public get targetInstances(): string[] {
        return this.syncRule.builder?.targetInstances ?? [];
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
        const params = this.syncRule.builder?.syncParams ?? {};
        return {
            enableMapping: false,
            includeSharingSettings: true,
            removeOrgUnitReferences: false,
            useDefaultIncludeExclude: true,
            ...params,
        };
    }

    public get dataParams(): DataSynchronizationParams {
        return this.syncRule.builder?.dataParams ?? {};
    }

    public static create(type: SynchronizationType = "metadata"): SyncRule {
        return new SyncRule({
            id: "",
            name: "",
            code: "",
            created: new Date(),
            description: "",
            type: type,
            builder: defaultSynchronizationBuilder,
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

    public static createOnDemand(type: SynchronizationType = "metadata"): SyncRule {
        return SyncRule.create(type).updateName("__MANUAL__");
    }

    public static build(syncRule: SynchronizationRule | undefined): SyncRule {
        return syncRule ? new SyncRule(syncRule) : this.create();
    }

    public static async get(api: D2Api, id: string): Promise<SyncRule> {
        const syncRuleData = await getDataById<SynchronizationRuleMain>(api, dataStoreKey, id);
        if (!syncRuleData) throw new Error(`SyncRule not found: ${id}`);
        const detailsKey = this.getDetailsKey(syncRuleData);
        const defaultDetails: SynchronizationRuleDetails = {
            builder: defaultSynchronizationBuilder,
        };
        const detailsData = await getDataStore(api, detailsKey, defaultDetails);
        const dataWithMapping = { ...syncRuleData, builder: detailsData.builder };
        return this.build(dataWithMapping);
    }

    public static async list(
        api: D2Api,
        filters: SyncRuleTableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        const {
            targetInstanceFilter = null,
            enabledFilter = null,
            lastExecutedFilter = null,
            type = null,
        } = filters || {};
        const { page = 1, pageSize = 20, paging = true, sorting } = pagination || {};

        const globalAdmin = await isGlobalAdmin(api);
        const userInfo = await getUserInfo(api);

        const data = await getPaginatedData(api, dataStoreKey, filters, { paging: false, sorting });
        const filteredObjects = _(data.objects as SynchronizationRuleMain[])
            .map(syncRuleMain => ({
                ...syncRuleMain,
                builder: {
                    ...defaultSynchronizationBuilder,
                    targetInstances: syncRuleMain.targetInstances,
                },
            }))
            .filter(data => {
                const rule = SyncRule.build(data);
                return _.isNull(type) || rule.type === type;
            })
            .filter(data => {
                const rule = SyncRule.build(data);
                return globalAdmin || rule.isVisibleToUser(userInfo);
            })
            .filter(rule =>
                targetInstanceFilter ? rule.targetInstances.includes(targetInstanceFilter) : true
            )
            .filter(rule => {
                if (!enabledFilter) return true;
                return (
                    (rule.enabled && enabledFilter === "enabled") ||
                    (!rule.enabled && enabledFilter === "disabled")
                );
            })
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

    public toBuilder(): SynchronizationBuilder {
        return _.pick(this, [
            "metadataIds",
            "filterRules",
            "excludedIds",
            "metadataTypes",
            "originInstance",
            "targetInstances",
            "syncParams",
            "dataParams",
        ]);
    }

    public updateId(id: string): SyncRule {
        return this.update({ id });
    }

    public updateName(name: string): SyncRule {
        return this.update({ name });
    }

    public updateCode(code: string): SyncRule {
        return this.update({ code });
    }

    public updateDescription(description: string): SyncRule {
        return this.update({ description });
    }

    public updateMetadataIds(metadataIds: string[]): SyncRule {
        const data = _(_.cloneDeep(this.syncRule))
            .set(["builder", "metadataIds"], metadataIds)
            .set(["builder", "syncParams", "useDefaultIncludeExclude"], true)
            .set(["builder", "syncParams", "metadataIncludeExcludeRules"], {})
            .value();

        return SyncRule.build(data);
    }

    public updateFilterRules(filterRules: FilterRule[]): SyncRule {
        return this.updateBuilder({ filterRules });
    }

    public markToUseDefaultIncludeExclude(): SyncRule {
        const data = _(_.cloneDeep(this.syncRule))
            .set(["builder", "syncParams", "useDefaultIncludeExclude"], true)
            .set(["builder", "syncParams", "metadataIncludeExcludeRules"], {})
            .value();

        return SyncRule.build(data);
    }

    public markToNotUseDefaultIncludeExclude(models: Array<typeof D2Model>): SyncRule {
        const rules: MetadataIncludeExcludeRules = models.reduce(
            (accumulator: any, model: typeof D2Model) => ({
                ...accumulator,
                [model.getMetadataType()]: {
                    includeRules: model.getIncludeRules().map(array => array.join(".")),
                    excludeRules: model.getExcludeRules().map(array => array.join(".")),
                },
            }),
            {}
        );

        const data = _(_.cloneDeep(this.syncRule))
            .set(["builder", "syncParams", "useDefaultIncludeExclude"], false)
            .set(["builder", "syncParams", "metadataIncludeExcludeRules"], rules)
            .value();

        return SyncRule.build(data);
    }

    public moveRuleFromExcludeToInclude(type: string, rulesToInclude: string[]): SyncRule {
        const {
            includeRules: oldIncludeRules,
            excludeRules: oldExcludeRules,
        } = this.metadataIncludeExcludeRules[type];

        if (_.difference(rulesToInclude, oldExcludeRules).length > 0) {
            throw Error(
                "Rules error: It's not possible move rules that do not exist in exclude to include"
            );
        }

        const rulesToIncludeWithParents = _(rulesToInclude)
            .map(extractParentsFromRule)
            .flatten()
            .union(rulesToInclude)
            .uniq()
            .value();

        const excludeIncludeRules = {
            includeRules: _.uniq([...oldIncludeRules, ...rulesToIncludeWithParents]),
            excludeRules: oldExcludeRules.filter(rule => !rulesToIncludeWithParents.includes(rule)),
        };

        return this.updateIncludeExcludeRules(type, excludeIncludeRules);
    }

    public moveRuleFromIncludeToExclude(type: string, rulesToExclude: string[]): SyncRule {
        const {
            includeRules: oldIncludeRules,
            excludeRules: oldExcludeRules,
        } = this.metadataIncludeExcludeRules[type];

        if (_.difference(rulesToExclude, oldIncludeRules).length > 0) {
            throw Error(
                "Rules error: It's not possible move rules that do not exist in include to exclude"
            );
        }

        const rulesToExcludeWithChildren = _(rulesToExclude)
            .map(rule => extractChildrenFromRules(rule, oldIncludeRules))
            .flatten()
            .union(rulesToExclude)
            .uniq()
            .value();

        const excludeIncludeRules = {
            includeRules: oldIncludeRules.filter(
                rule => !rulesToExcludeWithChildren.includes(rule)
            ),
            excludeRules: [...oldExcludeRules, ...rulesToExcludeWithChildren],
        };

        return this.updateIncludeExcludeRules(type, excludeIncludeRules);
    }

    private updateIncludeExcludeRules(
        type: string,
        excludeIncludeRules: ExcludeIncludeRules
    ): SyncRule {
        const rules = {
            ...this.metadataIncludeExcludeRules,
            [type]: excludeIncludeRules,
        };

        const data = _(_.cloneDeep(this.syncRule))
            .set(["builder", "syncParams", "metadataIncludeExcludeRules"], rules)
            .value();

        return SyncRule.build(data);
    }

    public update(partialRule: Partial<SynchronizationRule>): SyncRule {
        return SyncRule.build({ ...this.syncRule, ...partialRule });
    }

    public updateBuilder(partialBuilder: Partial<SynchronizationBuilder>): SyncRule {
        return this.update({
            builder: {
                ...defaultSynchronizationBuilder,
                ...this.syncRule.builder,
                ...partialBuilder,
            },
        });
    }

    public updateBuilderDataParams(
        partialDataParams: Partial<DataSynchronizationParams>
    ): SyncRule {
        return this.updateBuilder({
            dataParams: {
                ...this.syncRule.builder?.dataParams,
                ...partialDataParams,
            },
        });
    }

    public updateMetadataTypes(metadataTypes: string[]): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                metadataTypes,
            },
        });
    }

    public updateExcludedIds(excludedIds: string[]): SyncRule {
        return this.updateBuilder({ excludedIds });
    }

    public updateDataSyncAttributeCategoryOptions(attributeCategoryOptions?: string[]): SyncRule {
        return this.updateBuilderDataParams({ attributeCategoryOptions });
    }

    public updateDataSyncAllAttributeCategoryOptions(
        allAttributeCategoryOptions?: boolean
    ): SyncRule {
        return this.updateBuilderDataParams({ allAttributeCategoryOptions });
    }

    public updateDataSyncOrgUnitPaths(orgUnitPaths: string[]): SyncRule {
        return this.updateBuilderDataParams({ orgUnitPaths });
    }

    public updateDataSyncPeriod(period?: DataSyncPeriod): SyncRule {
        return this.updateBuilderDataParams({ period });
    }

    public updateDataSyncStartDate(startDate?: Date): SyncRule {
        return this.updateBuilderDataParams({ startDate });
    }

    public updateDataSyncEndDate(endDate?: Date): SyncRule {
        return this.updateBuilderDataParams({ endDate });
    }

    public updateDataSyncEvents(events?: string[]): SyncRule {
        return this.updateBuilderDataParams({ events });
    }

    public updateDataSyncAllEvents(allEvents?: boolean): SyncRule {
        return this.updateBuilderDataParams({ allEvents });
    }

    public updateDataSyncEnableAggregation(enableAggregation?: boolean): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                dataParams: {
                    ...this.syncRule.builder?.dataParams,
                    enableAggregation,
                },
            },
        });
    }

    public updateDataSyncAggregationType(aggregationType?: DataSyncAggregation): SyncRule {
        return SyncRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                dataParams: {
                    ...this.syncRule.builder?.dataParams,
                    aggregationType,
                },
            },
        });
    }

    public updateTargetInstances(targetInstances: string[]): SyncRule {
        return this.updateBuilder({ targetInstances });
    }

    public updateSyncParams(syncParams: MetadataSynchronizationParams): SyncRule {
        return this.updateBuilder({ syncParams });
    }

    public updateDataParams(dataParams: DataSynchronizationParams): SyncRule {
        return this.updateBuilder({ dataParams });
    }

    public updateEnabled(enabled: boolean): SyncRule {
        return this.update({ enabled });
    }

    public updateFrequency(frequency: string): SyncRule {
        return this.update({ frequency });
    }

    public updateLastExecuted(lastExecuted: Date): SyncRule {
        return this.update({ lastExecuted });
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

    private static getDetailsKey<SyncRule extends Ref>(syncRule: SyncRule): string {
        return dataStoreKey + "-" + syncRule.id;
    }

    public async save(api: D2Api): Promise<SyncRule> {
        const userInfo = await getUserInfo(api);
        const user = _.pick(userInfo, ["id", "name"]);
        const exists = !!this.syncRule.id;
        const syncRule = exists
            ? this.syncRule
            : { ...this.syncRule, id: generateUid(), created: new Date(), user };

        if (exists) await this.remove(api);

        const detailsKey = SyncRule.getDetailsKey(syncRule);
        const builder = syncRule.builder ?? defaultSynchronizationBuilder;
        const detailsData: SynchronizationRuleDetails = { builder };
        await saveDataStore(api, detailsKey, detailsData);
        const syncRuleMain: SynchronizationRuleMain = {
            ..._.omit(syncRule, ["builder"]),
            targetInstances: builder.targetInstances,
        };

        await saveData(api, dataStoreKey, {
            ...syncRuleMain,
            lastUpdated: new Date(),
            lastUpdatedBy: user,
        });

        return new SyncRule(syncRule);
    }

    public async remove(api: D2Api): Promise<void> {
        await deleteData(api, dataStoreKey, this.syncRule);
        const detailsKey = SyncRule.getDetailsKey(this.syncRule);
        await deleteDataStore(api, detailsKey);
    }

    private get usesFilterRules(): boolean {
        return this.type === "metadata";
    }

    public validate(): OldValidation {
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
                !this.usesFilterRules && this.metadataIds.length === 0
                    ? {
                          key: "cannot_be_empty",
                          namespace: { element: "metadata element" },
                      }
                    : null,
            ]),
            metadata: _.compact([
                this.usesFilterRules &&
                this.metadataIds.length === 0 &&
                this.filterRules.length === 0
                    ? {
                          key: "cannot_be_empty",
                          namespace: { element: "metadata element or create a filter rule" },
                      }
                    : null,
            ]),
            dataSyncOrganisationUnits: _.compact([
                this.type !== "metadata" &&
                this.type !== "deleted" &&
                this.dataSyncOrgUnitPaths.length === 0
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
            dataSyncAggregation: _.compact([
                this.type !== "metadata" &&
                this.type !== "deleted" &&
                this.dataSyncEnableAggregation &&
                !this.dataSyncAggregationType
                    ? {
                          key: "cannot_be_empty",
                          namespace: { element: "aggregation type" },
                      }
                    : null,
            ]),
            metadataIncludeExclude: [],
            targetInstances: _.compact([
                this.originInstance === "LOCAL" && this.targetInstances.length === 0
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
