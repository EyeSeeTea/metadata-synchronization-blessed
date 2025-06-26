import cronstrue from "cronstrue";
import { generateUid } from "d2/uid";
import _, { isEmpty } from "lodash";
import moment from "moment";
import { D2Model } from "../../../models/dhis/default";
import { extractChildrenFromRules, extractParentsFromRule } from "../../../utils/metadataIncludeExclude";
import { OldValidation } from "../../../utils/old-validations";
import { UserInfo } from "../../../utils/permissions";
import isValidCronExpression from "../../../utils/validCronExpression";
import { DataSyncAggregation } from "../../aggregated/entities/DataSyncAggregation";
import { DataSynchronizationParams } from "../../aggregated/entities/DataSynchronizationParams";
import { DataSyncPeriod } from "../../aggregated/entities/DataSyncPeriod";
import { NamedRef, SharedRef } from "../../common/entities/Ref";
import { SharingSetting } from "../../common/entities/SharingSetting";
import { FilterRule } from "../../metadata/entities/FilterRule";
import { ExcludeIncludeRules, MetadataIncludeExcludeRules } from "../../metadata/entities/MetadataExcludeIncludeRules";
import { MetadataSynchronizationParams } from "../../metadata/entities/MetadataSynchronizationParams";
import {
    defaultSynchronizationBuilder,
    SynchronizationBuilder,
} from "../../synchronization/entities/SynchronizationBuilder";
import { SynchronizationType } from "../../synchronization/entities/SynchronizationType";

export class SynchronizationRule {
    private readonly syncRule: SynchronizationRuleData;

    constructor(syncRule: SynchronizationRuleData) {
        this.syncRule = _.pick(syncRule, [
            "id",
            "name",
            "code",
            "created",
            "description",
            "builder",
            "targetInstances",
            "enabled",
            "schedulingFrequencyNeedsUpdate",
            "frequency",
            "lastExecuted",
            "lastExecutedBy",
            "lastSuccessfulSync",
            "lastUpdated",
            "lastUpdatedBy",
            "publicAccess",
            "user",
            "userAccesses",
            "userGroupAccesses",
            "type",
            "ondemand",
        ]);

        if (!this.syncRule.id) this.syncRule.id = generateUid();
    }

    public replicate(): SynchronizationRule {
        return this.updateName(`Copy of ${this.syncRule.name}`)
            .update({ lastExecuted: undefined, lastSuccessfulSync: undefined })
            .updateId(generateUid());
    }

    public toObject(): SynchronizationRuleData {
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

    public get dataSyncStartDate(): Date | undefined {
        return this.syncRule.builder?.dataParams?.startDate;
    }

    public get dataSyncEndDate(): Date | undefined {
        return this.syncRule.builder?.dataParams?.endDate;
    }

    public get dataSyncEvents(): string[] {
        return this.syncRule.builder?.dataParams?.events ?? [];
    }

    public get dataSyncTeis(): string[] {
        return this.syncRule.builder?.dataParams?.teis ?? [];
    }

    public get dataSyncAllEvents(): boolean {
        return this.syncRule.builder?.dataParams?.allEvents ?? true;
    }

    public get dataSyncAllTEIs(): boolean {
        return this.syncRule.builder?.dataParams?.allTEIs ?? true;
    }

    public get excludeTeiRelationships(): boolean {
        return this.syncRule.builder?.dataParams?.excludeTeiRelationships ?? false;
    }

    public get excludeEventCoordinates(): boolean {
        return this.syncRule.builder?.dataParams?.excludeEventCoordinates ?? false;
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

    public get metadataModelsSyncAll(): string[] {
        return this.syncRule.builder?.syncParams?.metadataModelsSyncAll ?? []; //TODO: might check if builder is really undefined, no need of "?", trust TS 963#discussion_r1682380337
    }

    public get targetInstances(): string[] {
        return this.syncRule.targetInstances;
    }

    public get enabled(): boolean {
        return this.syncRule.enabled ?? false;
    }

    public get schedulingFrequencyNeedsUpdate(): boolean {
        return this.syncRule.schedulingFrequencyNeedsUpdate ?? false;
    }

    public get frequency(): string | undefined {
        return this.syncRule.frequency;
    }

    public get lastExecuted(): Date | undefined {
        return this.syncRule.lastExecuted ? new Date(this.syncRule.lastExecuted) : undefined;
    }

    public get lastExecutedBy(): string | undefined {
        return this.syncRule.lastExecutedBy?.name;
    }

    public get lastSuccessfulSync(): Date | undefined {
        return this.syncRule.lastSuccessfulSync;
    }

    public get created(): Date | undefined {
        return this.syncRule.created ? new Date(this.syncRule.created) : undefined;
    }

    public get lastUpdated(): Date | undefined {
        return this.syncRule.lastUpdated ? new Date(this.syncRule.lastUpdated) : undefined;
    }

    public get lastUpdatedBy(): string | undefined {
        return this.syncRule.lastUpdatedBy?.name;
    }

    public get readableFrequency(): string | undefined {
        const { frequency } = this.syncRule;
        return frequency && isValidCronExpression(frequency) ? cronstrue.toString(frequency) : undefined;
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
            useDefaultIncludeExclude: true,
            metadataModelsSyncAll: [],
            includeSharingSettingsObjectsAndReferences: true,
            includeOnlySharingSettingsReferences: false,
            includeUsersObjectsAndReferences: true,
            includeOnlyUsersReferences: false,
            includeOrgUnitsObjectsAndReferences: true,
            includeOnlyOrgUnitsReferences: false,
            removeDefaultCategoryObjects: false,
            removeUserNonEssentialObjects: false,
            ...params,
        };
    }

    public get dataParams(): DataSynchronizationParams {
        return this.syncRule.builder?.dataParams ?? {};
    }

    public get ondemand(): boolean {
        return this.syncRule.ondemand ?? false;
    }

    public static create(type: SynchronizationType = "metadata"): SynchronizationRule {
        return new SynchronizationRule({
            id: "",
            name: "",
            code: "",
            created: new Date(),
            description: "",
            type: type,
            builder: defaultSynchronizationBuilder,
            targetInstances: [],
            enabled: false,
            schedulingFrequencyNeedsUpdate: false,
            lastUpdated: new Date(),
            lastUpdatedBy: {
                id: "",
                name: "",
            },
            lastExecutedBy: {
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

    public static createOnDemand(type: SynchronizationType = "metadata"): SynchronizationRule {
        return SynchronizationRule.create(type).updateName("__MANUAL__").updateOndemand(true);
    }

    public static build(syncRule: SynchronizationRuleData | undefined): SynchronizationRule {
        if (syncRule) {
            switch (syncRule.builder?.dataParams?.period) {
                case "SINCE_LAST_EXECUTED_DATE":
                    return new SynchronizationRule({
                        ...syncRule,
                        builder: {
                            ...syncRule.builder,
                            dataParams: {
                                ...syncRule.builder.dataParams,
                                startDate: syncRule.lastExecuted ?? new Date(),
                            },
                        },
                    });
                case "SINCE_LAST_SUCCESSFUL_SYNC":
                    return new SynchronizationRule({
                        ...syncRule,
                        builder: {
                            ...syncRule.builder,
                            dataParams: {
                                ...syncRule.builder.dataParams,
                                startDate: syncRule.lastSuccessfulSync,
                            },
                        },
                    });
                default:
                    return new SynchronizationRule(syncRule);
            }
        } else {
            return this.create();
        }
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

    public updateId(id: string): SynchronizationRule {
        return this.update({ id });
    }

    public updateName(name: string): SynchronizationRule {
        return this.update({ name });
    }

    public updateCode(code: string): SynchronizationRule {
        return this.update({ code });
    }

    public updateDescription(description: string): SynchronizationRule {
        return this.update({ description });
    }

    public updateMetadataIds(metadataIds: string[]): SynchronizationRule {
        return this.updateBuilder({ metadataIds });
    }

    public updateFilterRules(filterRules: FilterRule[]): SynchronizationRule {
        return this.updateBuilder({ filterRules });
    }

    public updateOndemand(ondemand: boolean): SynchronizationRule {
        return this.update({ ondemand });
    }

    public markToUseDefaultIncludeExclude(): SynchronizationRule {
        const data = _(_.cloneDeep(this.syncRule))
            .set(["builder", "syncParams", "useDefaultIncludeExclude"], true)
            .set(["builder", "syncParams", "metadataIncludeExcludeRules"], {})
            .value();

        return SynchronizationRule.build(data);
    }

    public markToNotUseDefaultIncludeExclude(models: Array<typeof D2Model>): SynchronizationRule {
        const rules: MetadataIncludeExcludeRules = models.reduce(
            (accumulator: any, model: typeof D2Model) => ({
                ...accumulator,
                [model.getMetadataType()]: {
                    includeRules: model.getIncludeRules().map(array => array.join(".")),
                    excludeRules: model.getExcludeRules().map(array => array.join(".")),
                    includeOnlyReferencesRules: [],
                    includeReferencesAndObjectsRules: model.getIncludeRules().map(array => array.join(".")),
                },
            }),
            {}
        );

        const data = _(_.cloneDeep(this.syncRule))
            .set(["builder", "syncParams", "useDefaultIncludeExclude"], false)
            .set(["builder", "syncParams", "metadataIncludeExcludeRules"], rules)
            .value();

        return SynchronizationRule.build(data);
    }

    public moveRuleFromExcludeToInclude(type: string, rulesToInclude: string[]): SynchronizationRule {
        const {
            includeRules: oldIncludeRules,
            excludeRules: oldExcludeRules,
            includeOnlyReferencesRules: oldIncludeOnlyReferencesRules,
            includeReferencesAndObjectsRules: oldIncludeReferencesAndObjectsRules,
        } = this.metadataIncludeExcludeRules[type];

        if (_.difference(rulesToInclude, oldExcludeRules).length > 0) {
            throw Error("Rules error: It's not possible move rules that do not exist in exclude to include");
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
            includeOnlyReferencesRules: oldIncludeOnlyReferencesRules,
            includeReferencesAndObjectsRules: _.uniq([
                ...oldIncludeReferencesAndObjectsRules,
                ...rulesToIncludeWithParents,
            ]),
        };

        return this.updateIncludeExcludeRules(type, excludeIncludeRules);
    }

    public moveRuleFromIncludeToExclude(type: string, rulesToExclude: string[]): SynchronizationRule {
        const {
            includeRules: oldIncludeRules,
            excludeRules: oldExcludeRules,
            includeOnlyReferencesRules: oldIncludeOnlyReferencesRules,
            includeReferencesAndObjectsRules: oldIncludeReferencesAndObjectsRules,
        } = this.metadataIncludeExcludeRules[type];

        if (_.difference(rulesToExclude, oldIncludeRules).length > 0) {
            throw Error("Rules error: It's not possible move rules that do not exist in include to exclude");
        }

        const rulesToExcludeWithChildren = _(rulesToExclude)
            .map(rule => extractChildrenFromRules(rule, oldIncludeRules))
            .flatten()
            .union(rulesToExclude)
            .uniq()
            .value();

        const excludeIncludeRules = {
            includeRules: oldIncludeRules.filter(rule => !rulesToExcludeWithChildren.includes(rule)),
            excludeRules: [...oldExcludeRules, ...rulesToExcludeWithChildren],
            includeOnlyReferencesRules: oldIncludeOnlyReferencesRules.filter(
                rule => !rulesToExcludeWithChildren.includes(rule)
            ),
            includeReferencesAndObjectsRules: oldIncludeReferencesAndObjectsRules.filter(
                rule => !rulesToExcludeWithChildren.includes(rule)
            ),
        };

        return this.updateIncludeExcludeRules(type, excludeIncludeRules);
    }

    public moveFromIncludeOnlyReferencesToReferencesAndObjects(
        type: string,
        rulesToIncludeRefsAndObjects: string[]
    ): SynchronizationRule {
        const {
            includeRules: oldIncludeRules,
            excludeRules: oldExcludeRules,
            includeOnlyReferencesRules: oldIncludeOnlyReferencesRules,
            includeReferencesAndObjectsRules: oldIncludeReferencesAndObjectsRules,
        } = this.metadataIncludeExcludeRules[type];

        if (_.difference(rulesToIncludeRefsAndObjects, oldIncludeOnlyReferencesRules).length > 0) {
            throw Error(
                "Rules error: It's not possible to move rules that do not exist in includeOnlyReferencesRules to includeReferencesAndObjectsRules"
            );
        }

        const rulesToIncludeWithParents = _(rulesToIncludeRefsAndObjects)
            .map(extractParentsFromRule)
            .flatten()
            .union(rulesToIncludeRefsAndObjects)
            .uniq()
            .value();

        const excludeIncludeRules = {
            includeRules: oldIncludeRules,
            excludeRules: oldExcludeRules,
            includeOnlyReferencesRules: oldIncludeOnlyReferencesRules.filter(
                rule => !rulesToIncludeWithParents.includes(rule)
            ),
            includeReferencesAndObjectsRules: _.uniq([
                ...oldIncludeReferencesAndObjectsRules,
                ...rulesToIncludeWithParents,
            ]),
        };

        return this.updateIncludeExcludeRules(type, excludeIncludeRules);
    }

    public moveRuleFromIncludeReferencesAndObjectsToOnlyReferences(
        type: string,
        rulesToIncludeOnlyReferences: string[]
    ): SynchronizationRule {
        const {
            includeRules: oldIncludeRules,
            excludeRules: oldExcludeRules,
            includeOnlyReferencesRules: oldIncludeOnlyReferencesRules,
            includeReferencesAndObjectsRules: oldIncludeReferencesAndObjectsRules,
        } = this.metadataIncludeExcludeRules[type];

        if (_.difference(rulesToIncludeOnlyReferences, oldIncludeReferencesAndObjectsRules).length > 0) {
            throw Error(
                "Rules error: It's not possible move rules that do not exist in includeReferencesAndObjectsRule to includeOnlyReferencesRules"
            );
        }

        const rulesToExcludeWithChildren = _(rulesToIncludeOnlyReferences)
            .map(rule => extractChildrenFromRules(rule, oldIncludeRules))
            .flatten()
            .union(rulesToIncludeOnlyReferences)
            .uniq()
            .value();

        const excludeIncludeRules = {
            includeRules: oldIncludeRules,
            excludeRules: oldExcludeRules,
            includeOnlyReferencesRules: [...oldIncludeOnlyReferencesRules, ...rulesToExcludeWithChildren],
            includeReferencesAndObjectsRules: oldIncludeReferencesAndObjectsRules.filter(
                rule => !rulesToExcludeWithChildren.includes(rule)
            ),
        };

        return this.updateIncludeExcludeRules(type, excludeIncludeRules);
    }

    private updateIncludeExcludeRules(type: string, excludeIncludeRules: ExcludeIncludeRules): SynchronizationRule {
        const rules = {
            ...this.metadataIncludeExcludeRules,
            [type]: excludeIncludeRules,
        };

        const data = _(_.cloneDeep(this.syncRule))
            .set(["builder", "syncParams", "metadataIncludeExcludeRules"], rules)
            .value();

        return SynchronizationRule.build(data);
    }

    public update(partialRule: Partial<SynchronizationRuleData>): SynchronizationRule {
        return SynchronizationRule.build({ ...this.syncRule, ...partialRule });
    }

    public updateBuilder(partialBuilder: Partial<SynchronizationBuilder>): SynchronizationRule {
        return this.update({
            builder: {
                ...defaultSynchronizationBuilder,
                ...this.syncRule.builder,
                ...partialBuilder,
            },
        });
    }

    public updateBuilderDataParams(partialDataParams: Partial<DataSynchronizationParams>): SynchronizationRule {
        const dataParams = this.syncRule.builder?.dataParams ?? {};
        return this.updateBuilder({
            dataParams: {
                ...dataParams,
                ...partialDataParams,
            },
        });
    }

    public updateMetadataTypes(metadataTypes: string[]): SynchronizationRule {
        return SynchronizationRule.build({
            ...this.syncRule,
            builder: {
                ...this.syncRule.builder,
                metadataTypes,
            },
        });
    }

    public updateExcludedIds(excludedIds: string[]): SynchronizationRule {
        return this.updateBuilder({ excludedIds });
    }

    public updateDataSyncAttributeCategoryOptions(attributeCategoryOptions?: string[]): SynchronizationRule {
        return this.updateBuilderDataParams({ attributeCategoryOptions });
    }

    public updateDataSyncAllAttributeCategoryOptions(allAttributeCategoryOptions?: boolean): SynchronizationRule {
        return this.updateBuilderDataParams({ allAttributeCategoryOptions });
    }

    public updateDataSyncOrgUnitPaths(orgUnitPaths: string[]): SynchronizationRule {
        return this.updateBuilderDataParams({ orgUnitPaths });
    }

    public updateDataSyncPeriod(period?: DataSyncPeriod): SynchronizationRule {
        return this.updateBuilderDataParams({ period });
    }

    public updateDataSyncStartDate(startDate?: Date): SynchronizationRule {
        return this.updateBuilderDataParams({ startDate });
    }

    public updateDataSyncEndDate(endDate?: Date): SynchronizationRule {
        return this.updateBuilderDataParams({ endDate });
    }

    public updateDataSyncEvents(events?: string[]): SynchronizationRule {
        return this.updateBuilderDataParams({ events });
    }

    public updateDataSyncTEIs(teis?: string[]): SynchronizationRule {
        return this.updateBuilderDataParams({ teis });
    }

    public updateDataSyncAllEvents(allEvents?: boolean): SynchronizationRule {
        return this.updateBuilderDataParams({ allEvents });
    }

    public updateDataSyncAllTEIs(allTEIs?: boolean): SynchronizationRule {
        return this.updateBuilderDataParams({ allTEIs });
    }

    public updateExcludeTeiRelationships(excludeTeiRelationships?: boolean): SynchronizationRule {
        return this.updateBuilderDataParams({ excludeTeiRelationships });
    }

    public updateExcludeEventCoordinates(excludeEventCoordinates?: boolean): SynchronizationRule {
        return this.updateBuilderDataParams({ excludeEventCoordinates });
    }

    public updateDataSyncEnableAggregation(enableAggregation?: boolean): SynchronizationRule {
        return SynchronizationRule.build({
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

    public updateDataSyncAggregationType(aggregationType?: DataSyncAggregation): SynchronizationRule {
        return SynchronizationRule.build({
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

    public updateTargetInstances(targetInstances: string[]): SynchronizationRule {
        return this.update({ targetInstances }).updateBuilder({ targetInstances });
    }

    public updateSyncParams(syncParams: Partial<MetadataSynchronizationParams>): SynchronizationRule {
        const params = this.syncRule.builder?.syncParams ?? {
            enableMapping: false,
            useDefaultIncludeExclude: true,
            metadataModelsSyncAll: [],
            includeSharingSettingsObjectsAndReferences: true,
            includeOnlySharingSettingsReferences: false,
            includeUsersObjectsAndReferences: true,
            includeOnlyUsersReferences: false,
            includeOrgUnitsObjectsAndReferences: true,
            includeOnlyOrgUnitsReferences: false,
            removeDefaultCategoryObjects: false,
            removeUserNonEssentialObjects: false,
        };

        return this.updateBuilder({
            syncParams: {
                ...params,
                ...syncParams,
            },
        });
    }

    public updateMetadataModelsSyncAll(metadataModelsSyncAll: string[]): SynchronizationRule {
        return this.updateSyncParams({ metadataModelsSyncAll });
    }

    public updateDataParams(dataParams: DataSynchronizationParams): SynchronizationRule {
        return this.updateBuilder({ dataParams });
    }

    public updateEnabled(enabled: boolean): SynchronizationRule {
        return this.update({ enabled });
    }

    public updateNeedsUpdateSchedulingFrequency(schedulingFrequencyNeedsUpdate: boolean): SynchronizationRule {
        return this.update({ schedulingFrequencyNeedsUpdate });
    }

    public updateFrequency(frequency: string): SynchronizationRule {
        return this.update({ frequency });
    }

    public updateLastExecuted(lastExecuted: Date, lastExecutedBy: NamedRef): SynchronizationRule {
        return this.update({ lastExecuted, lastExecutedBy });
    }

    public updateLastSuccessfulSync(lastSuccessfulSync: Date): SynchronizationRule {
        return this.update({ lastSuccessfulSync });
    }

    public isOnDemand() {
        return this.name === "__MANUAL__";
    }

    public isVisibleToUser(userInfo: UserInfo, permission: "READ" | "WRITE" = "READ") {
        const { id: userId, userGroups } = userInfo;
        const token = permission === "READ" ? "r" : "w";
        const { publicAccess = "--------", userAccesses = [], userGroupAccesses = [] } = this.syncRule;

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
                !this.usesFilterRules && isEmpty(this.metadataIds)
                    ? {
                          key: "cannot_be_empty",
                          namespace: { element: "metadata element" },
                      }
                    : null,
            ]),
            metadata: _.compact([
                this.usesFilterRules &&
                isEmpty(this.metadataIds) &&
                isEmpty(this.filterRules) &&
                isEmpty(this.builder.syncParams?.metadataModelsSyncAll)
                    ? {
                          key: "cannot_be_empty",
                          namespace: { element: "metadata element or create a filter rule" },
                      }
                    : null,
            ]),
            dataSyncOrganisationUnits: _.compact([
                this.type !== "metadata" && this.type !== "deleted" && isEmpty(this.dataSyncOrgUnitPaths)
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
            dataSyncEventsTeisOrAggregation: _.compact([
                this.type === "events" &&
                !this.dataSyncAllEvents &&
                !this.dataSyncAllTEIs &&
                isEmpty(this.dataSyncEvents) &&
                isEmpty(this.dataSyncTeis) &&
                !this.dataSyncEnableAggregation
                    ? {
                          key: "cannot_be_empty",
                          namespace: { element: "event, TEI or enable data aggregation" },
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
                this.originInstance === "LOCAL" && isEmpty(this.targetInstances)
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
        const validation = this.validate();
        return _(Object.values(validation)).flatten().isEmpty();
    }
}

export interface SynchronizationRuleData extends SharedRef {
    code?: string;
    created: Date;
    description?: string;
    builder: SynchronizationBuilder;
    targetInstances: string[];
    enabled: boolean;
    schedulingFrequencyNeedsUpdate?: boolean;
    lastExecuted?: Date;
    lastExecutedBy?: NamedRef;
    lastSuccessfulSync?: Date;
    frequency?: string;
    type: SynchronizationType;
    ondemand?: boolean;
}
