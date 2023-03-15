import { MigrationParams } from ".";
import { DataSyncAggregation } from "../../../domain/aggregated/entities/DataSyncAggregation";
import { DataImportParams } from "../../../domain/aggregated/entities/DataSynchronizationParams";
import { DataSyncPeriod } from "../../../domain/aggregated/entities/DataSyncPeriod";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Migration } from "../client/types";

export interface OldSynchronizationRuleData {
    id: string;
    type: string;
}

export interface OldSynchronizationBuilder {
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
    allTEIs?: boolean;
    excludeTeiRelationships?: boolean;
    generateNewUid?: boolean;
    enableAggregation?: boolean;
    aggregationType?: DataSyncAggregation;
    runAnalytics?: boolean;
    includeAnalyticsZeroValues?: boolean;
    analyticsYears?: number;
    ignoreDuplicateExistingValues?: boolean;
}

export async function migrate(storage: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const oldRules = (await storage.get<OldSynchronizationRuleData[]>("rules")) ?? [];

    const oldEventRules = oldRules.filter(event => event.type === "events");

    await promiseMap(oldEventRules, async oldRule => {
        const oldRuleDetails = await storage.get<OldSynchronizationRuleDetails>("rules-" + oldRule.id);

        if (oldRuleDetails) {
            const oldDataParams = oldRuleDetails.builder.dataParams;

            const newDataParams: NewDataSynchronizationParams = { ...oldDataParams, allTEIs: false };

            const newRuleDatails: NewSynchronizationRuleDetails = {
                builder: { ...oldRuleDetails?.builder, dataParams: newDataParams },
            };

            await storage.save("rules-" + oldRule.id, newRuleDatails);
        }
    });
}

const migration: Migration<MigrationParams> = {
    name: "Create in existed events rules a new field allTEIs to false",
    migrate,
};

export default migration;
