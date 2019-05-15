import _ from "lodash";
import "../utils/lodash-mixins";

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

async function exportMetadata(d2: D2, builder: ExportBuilder): Promise<MetadataPackage> {
    const { type, ids, excludeRules, includeRules } = builder;
    const model = d2ModelFactory(d2, type).getD2Model(d2);
    const result: MetadataPackage = {};

    // Each level of recursion traverse the exclude/include rules with nested values
    const nestedExcludeRules: NestedRules = buildNestedRules(excludeRules);
    const nestedIncludeRules: NestedRules = buildNestedRules(includeRules);

    // Get all the required metadata
    const syncMetadata = await getMetadata(d2, ids);
    const elements = syncMetadata[model.plural] || [];

    // TODO: We are now doing a sequential synchronization
    // Parallel requests could be done but we need to implement a Promise queue (cwait)
    // Attempting to perform all the requests without a queue blocks the server and affects performance
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
                ids: references[type],
                excludeRules: nestedExcludeRules[type],
                includeRules: nestedIncludeRules[type],
            }))
            .map(newBuilder => exportMetadata(d2, newBuilder));
        const promisesResult: MetadataPackage[] = await Promise.all(promises);
        _.deepMerge(result, ...promisesResult);
    }

    // Clean up result from duplicated elements
    _.forOwn(result, (value, metadataType) => (result[metadataType] = _.uniqBy(value, "id")));
    return result;
}

async function importMetadata(
    d2: D2,
    instance: Instance,
    metadataPackage: MetadataPackage
): Promise<SynchronizationResult> {
    const importResult = await postMetadata(instance, metadataPackage);

    const typeStats: any[] = [];
    const messages: any[] = [];

    if (importResult.data.typeReports) {
        importResult.data.typeReports.forEach((report: any) => {
            const { klass, stats, objectReports = [] } = report;

            typeStats.push({
                ...stats,
                type: getClassName(klass),
            });

            objectReports.forEach((detail: any) => {
                const { uid, errorReports = [] } = detail;

                messages.push(
                    ...errorReports.map((error: any) => ({
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
        ...importResult.data,
        instance: _.pick(instance, ["id", "name", "url", "username"]),
        report: { typeStats, messages },
    };
}

export async function startSynchronization(
    d2: D2,
    builder: SynchronizationBuilder
): Promise<SyncReport> {
    const { targetInstances: targetInstanceIds, metadata } = builder;

    // Phase 1: Export and package metadata from origin instance
    const exportPromises = _.keys(metadata)
        .map(type => {
            const myClass = d2ModelFactory(d2, type);
            return {
                type,
                ids: metadata[type],
                excludeRules: myClass.getExcludeRules(),
                includeRules: myClass.getIncludeRules(),
            };
        })
        .map(newBuilder => exportMetadata(d2, newBuilder));
    const exportResults: MetadataPackage[] = await Promise.all(exportPromises);
    const metadataPackage = _.deepMerge({}, ...exportResults);

    // Phase 2: Create parent synchronization task
    const targetInstances: Instance[] = await Promise.all(
        targetInstanceIds.map(id => Instance.get(d2, id))
    );

    const syncReport = SyncReport.build({
        user: d2.currentUser.username,
        metadata: metadataPackage,
        status: "RUNNING" as SynchronizationReportStatus,
        results: targetInstances.map(instance => ({
            instance: instance.toObject(),
            status: "PENDING" as MetadataImportStatus,
        })),
    });
    await syncReport.save(d2);

    // Phase 3: Import metadata into destination instances
    for (const instanceId of targetInstances) {
        const result = await importMetadata(d2, instanceId, metadataPackage);
        syncReport.addSyncResult(result);
        await syncReport.save(d2);
    }

    // Phase 4: Update parent task status
    syncReport.setStatus(syncReport.hasErrors() ? "FAILURE" : "DONE");
    await syncReport.save(d2);

    return syncReport;
}
