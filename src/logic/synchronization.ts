import _ from "lodash";
import "../utils/lodash-mixins";

import Instance from "../models/instance";
import { d2ModelFactory } from "../models/d2ModelFactory";
import { D2 } from "../types/d2";
import {
    ExportBuilder,
    NestedRules,
    SynchronizationBuilder,
    SynchronizationResult,
} from "../types/synchronization";
import { cleanObject } from "../utils/d2";
import {
    buildNestedRules,
    getAllReferences,
    getMetadata,
    postMetadata,
} from "../utils/synchronization";

async function exportMetadata(d2: D2, builder: ExportBuilder): Promise<SynchronizationResult> {
    const { type, ids, excludeRules, includeRules } = builder;
    const model = d2ModelFactory(d2, type).getD2Model(d2);
    const result: SynchronizationResult = {};

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
        const object = cleanObject(element, excludeRules);

        // Store Organisation Unit in result object
        result[model.plural] = result[model.plural] || [];
        result[model.plural].push(object);

        // Get all the referenced metadata
        const references: SynchronizationResult = getAllReferences(d2, object, model.name);
        const referenceTypes = _.intersection(_.keys(references), includeRules);
        const promises = _.map(referenceTypes, type => {
            return {
                type,
                ids: references[type],
                excludeRules: nestedExcludeRules[type],
                includeRules: nestedIncludeRules[type],
            };
        }).map(newBuilder => exportMetadata(d2, newBuilder));
        const promisesResult: SynchronizationResult[] = await Promise.all(promises);
        _.deepMerge(result, ...promisesResult);
    }

    // Clean up result from duplicated elements
    _.forOwn(result, (value, metadataType) => (result[metadataType] = _.uniqBy(value, "id")));
    return result;
}

async function importMetadata(
    d2: D2,
    instance: Instance,
    metadataPackage: SynchronizationResult
): Promise<void> {
    // TODO: Obtain import results and add warnings/errors to the logger
    const importResult = await postMetadata(instance, metadataPackage);

    // DEBUG: Print response from import
    console.log("[DEBUG] HTTP Status", importResult.status);
    console.log("[DEBUG] Import Stats", importResult.data.status, importResult.data.stats);
    // END OF DEBUG SECTION

    return importResult;
}

export async function startSynchronization(d2: D2, builder: SynchronizationBuilder): Promise<any> {
    // Phase 1: Export and package metadata from origin instance
    const exportPromises = _.keys(builder.metadata)
        .map(type => {
            const myClass = d2ModelFactory(d2, type);
            return {
                type,
                ids: builder.metadata[type],
                excludeRules: myClass.getExcludeRules(),
                includeRules: myClass.getIncludeRules(),
            };
        })
        .map(newBuilder => exportMetadata(d2, newBuilder));
    const exportResults: SynchronizationResult[] = await Promise.all(exportPromises);
    const metadataPackage = _.deepMerge({}, ...exportResults);

    // DEBUG: Print metadata package for now to console.log
    console.log("[DEBUG] Metadata package", metadataPackage);
    // END OF DEBUG SECTION

    // Phase 2: Import metadata into destination instances
    const importPromises = builder.targetInstances.map(instance =>
        importMetadata(d2, instance, metadataPackage)
    );
    const importResults: any[] = await Promise.all(importPromises);
    return await _.deepMerge({}, ...importResults);
}
