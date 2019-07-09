import _ from "lodash";
import "../utils/lodash-mixins";
import i18n from "@dhis2/d2-i18n";

import Instance from "../models/instance";
import SyncReport from "../models/syncReport";
import { d2ModelFactory } from "../models/d2ModelFactory";
import { D2, MetadataImportStatus } from "../types/d2";
import {
    ExportBuilder,
    MetadataPackage,
    NestedRules,
    SynchronizationBuilder,
    SynchronizationReportStatus,
    SynchronizationResult,
    SynchronizationState,
} from "../types/synchronization";
import {
    buildNestedRules,
    cleanObject,
    cleanReferences,
    getAllReferences,
    getMetadata,
    postMetadata,
} from "../utils/synchronization";
import { getClassName } from "../utils/d2";

async function exportMetadata(d2: D2, originalBuilder: ExportBuilder): Promise<MetadataPackage> {
    const visitedIds: Set<string> = new Set();
    const recursiveExport = async (builder: ExportBuilder): Promise<MetadataPackage> => {
        const { type, ids, excludeRules, includeRules } = builder;
        const model = d2ModelFactory(d2, type).getD2Model(d2);
        const result: MetadataPackage = {};

        // Each level of recursion traverse the exclude/include rules with nested values
        const nestedExcludeRules: NestedRules = buildNestedRules(excludeRules);
        const nestedIncludeRules: NestedRules = buildNestedRules(includeRules);

        // Get all the required metadata
        const syncMetadata = await getMetadata(d2, ids);
        const elements = syncMetadata[model.plural] || [];

        for (const element of elements) {
            // Store metadata object in result
            const object = cleanObject(element, excludeRules);
            result[model.plural] = result[model.plural] || [];
            result[model.plural].push(object);

            // Get all the referenced metadata
            const references: MetadataPackage = getAllReferences(d2, object, model.name);
            const includedReferences = cleanReferences(references, includeRules);
            const promises = includedReferences
                .map(type => ({
                    type,
                    ids: references[type].filter(id => !visitedIds.has(id)),
                    excludeRules: nestedExcludeRules[type],
                    includeRules: nestedIncludeRules[type],
                }))
                .map(newBuilder => {
                    newBuilder.ids.forEach(id => {
                        visitedIds.add(id);
                    });
                    return recursiveExport(newBuilder);
                });
            const promisesResult: MetadataPackage[] = await Promise.all(promises);
            _.deepMerge(result, ...promisesResult);
        }

        // Clean up result from duplicated elements
        return _.mapValues(result, objects => _.uniqBy(objects, "id"));
    };
    return recursiveExport(originalBuilder);
}

async function importMetadata(
    instance: Instance,
    metadataPackage: MetadataPackage
): Promise<SynchronizationResult> {
    const importResult = await postMetadata(instance, metadataPackage);

    const typeStats: any[] = [];
    const messages: any[] = [];

    if (importResult.typeReports) {
        importResult.typeReports.forEach(report => {
            const { klass, stats, objectReports = [] } = report;

            typeStats.push({
                ...stats,
                type: getClassName(klass),
            });

            objectReports.forEach((detail: any) => {
                const { uid, errorReports = [] } = detail;

                messages.push(
                    ..._.take(errorReports, 1).map((error: any) => ({
                        uid,
                        type: getClassName(error.mainKlass),
                        property: error.errorProperty,
                        message: error.message,
                    }))
                );
            });
        });
    }

    return {
        ..._.pick(importResult, ["status", "stats"]),
        instance: _.pick(instance, ["id", "name", "url", "username"]),
        report: { typeStats, messages },
        date: new Date(),
    };
}

export async function* startSynchronization(
    d2: D2,
    builder: SynchronizationBuilder
): AsyncIterableIterator<SynchronizationState> {
    const { targetInstances: targetInstanceIds, metadataIds, syncRule } = builder;

    // Phase 1: Export and package metadata from origin instance
    console.debug("Start synchronization process");
    yield { message: i18n.t("Fetching metadata from origin instance") };
    const metadata = await getMetadata(d2, metadataIds, "id");
    const exportPromises = _.keys(metadata)
        .map(type => {
            const myClass = d2ModelFactory(d2, type);
            return {
                type,
                ids: metadata[type].map(e => e.id),
                excludeRules: myClass.getExcludeRules(),
                includeRules: myClass.getIncludeRules(),
            };
        })
        .map(newBuilder => exportMetadata(d2, newBuilder));
    const exportResults: MetadataPackage[] = await Promise.all(exportPromises);
    const metadataPackage = _.deepMerge({}, ...exportResults);
    console.debug("Metadata package from origin instance done", metadataPackage);

    // Phase 2: Create parent synchronization task
    yield { message: i18n.t("Retrieving information from remote instances") };
    const targetInstances: Instance[] = await Promise.all(
        targetInstanceIds.map(id => Instance.get(d2, id))
    );

    const syncReport = SyncReport.build({
        user: d2.currentUser.username,
        types: _.keys(metadata),
        status: "RUNNING" as SynchronizationReportStatus,
        syncRule,
    });
    syncReport.addSyncResult(
        ...targetInstances.map(instance => ({
            instance: instance.toObject(),
            status: "PENDING" as MetadataImportStatus,
            date: new Date(),
        }))
    );
    yield { syncReport };

    // Phase 3: Import metadata into destination instances
    for (const instance of targetInstances) {
        yield {
            message: i18n.t("Importing data in instance {{instance}}", {
                instance: instance.name,
            }),
        };
        console.debug("Start import on destination instance", instance);
        const result = await importMetadata(instance, metadataPackage);
        syncReport.addSyncResult(result);
        console.debug("Finished importing data on instance", instance);
        yield { syncReport };
    }

    // Phase 4: Update parent task status
    syncReport.setStatus(syncReport.hasErrors() ? "FAILURE" : "DONE");
    yield { syncReport, done: true };

    return syncReport;
}
