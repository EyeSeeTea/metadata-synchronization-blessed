import { generateUid } from "d2/uid";
import _ from "lodash";
import { MigrationParams } from ".";
import { DataSyncAggregation } from "../../../domain/aggregated/entities/DataSyncAggregation";
import { DataImportParams } from "../../../domain/aggregated/entities/DataSynchronizationParams";
import { DataSyncPeriod } from "../../../domain/aggregated/entities/DataSyncPeriod";
import { NamedRef, SharedRef } from "../../../domain/common/entities/Ref";
import { FilterRule } from "../../../domain/metadata/entities/FilterRule";
import { MetadataSynchronizationParams } from "../../../domain/metadata/entities/MetadataSynchronizationParams";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { SynchronizationType } from "../../../domain/synchronization/entities/SynchronizationType";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Migration } from "../client/types";

export interface OldSynchronizationRuleData {
    id: string;
}

export interface OldSynchronizationBuilder {
    originInstance: string;
    targetInstances: string[];
    metadataIds: string[];
    filterRules?: FilterRule[];
    excludedIds: string[];
    metadataTypes?: string[];
    syncRule?: string;
    syncParams?: MetadataSynchronizationParams;
    dataParams?: OldDataSynchronizationParams;
}

export interface OldDataSynchronizationParams extends DataImportParams {
    attributeCategoryOptions?: string[];
    allAttributeCategoryOptions?: boolean;
    orgUnitPaths?: string[];
    period?: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
    lastUpdated?: Date;
    events?: string[];
    teis?: string[];
    allEvents?: boolean;
    excludeTeiRelationships?: boolean;
    generateNewUid?: boolean;
    enableAggregation?: boolean;
    aggregationType?: DataSyncAggregation;
    runAnalytics?: boolean;
    includeAnalyticsZeroValues?: boolean;
    analyticsYears?: number;
    ignoreDuplicateExistingValues?: boolean;
}

export interface OldSynchronizationRuleDetails {
    builder: OldSynchronizationBuilder;
}

export interface NewSynchronizationRuleDetails {
    builder: NewSynchronizationBuilder;
}

export interface NewSynchronizationBuilder {
    originInstance: string;
    targetInstances: string[];
    metadataIds: string[];
    filterRules?: FilterRule[];
    excludedIds: string[];
    metadataTypes?: string[];
    syncRule?: string;
    syncParams?: MetadataSynchronizationParams;
    dataParams?: NewDataSynchronizationParams;
}

export interface NewDataSynchronizationParams extends DataImportParams {
    attributeCategoryOptions?: string[];
    allAttributeCategoryOptions?: boolean;
    orgUnitPaths?: string[];
    period?: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
    lastUpdated?: Date;
    events?: string[];
    teis?: string[];
    allEvents?: boolean;
    excludeTeiRelationships?: boolean;
    generateNewUid?: boolean;
    enableAggregation?: boolean;
    aggregationType?: DataSyncAggregation;
    runAnalyticsBefore?: boolean;
    includeAnalyticsZeroValues?: boolean;
    analyticsYears?: number;
    ignoreDuplicateExistingValues?: boolean;
}

export async function migrate(storage: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const oldRules = (await storage.get<OldSynchronizationRuleData[]>("rules")) ?? [];

    await promiseMap(oldRules, async oldRule => {
        const oldRuleDetails = await storage.get<OldSynchronizationRuleDetails>("rules-" + oldRule.id);

        debugger;

        if (oldRuleDetails) {
            const oldDataParams = oldRuleDetails.builder.dataParams;

            const newDataParams = renameProp(oldDataParams, "runAnalytics", "runAnalyticsBefore");

            const newRuleDatails: NewSynchronizationRuleDetails = {
                builder: { ...oldRuleDetails?.builder, dataParams: newDataParams },
            };

            await storage.save("rules-" + oldRule.id, newRuleDatails);
        }
    });
}

export function renameProp(item: any, oldPath: string, newPath: string) {
    const object = _.cloneDeep(item);

    const value = _.get(object, oldPath);
    _.unset(object, oldPath);
    _.set(object, newPath, value);

    return object;
}

const migration: Migration<MigrationParams> = {
    name: "Rename runAnalytics data param to runAnalyticsBefore",
    migrate,
};

export default migration;
