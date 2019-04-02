import _ from "lodash";
import "../utils/lodash-mixins";

import Instance from "../models/instance";
import { d2ModelFactory } from "../models/d2ModelFactory";
import { D2 } from "../types/d2";
import {
    ExportBuilder,
    NestedRules,
    SynchronizationBuilder,
    MetadataPackage,
    SynchronizationResult,
} from "../types/synchronization";
import { cleanObject } from "../utils/d2";
import {
    buildNestedRules,
    getAllReferences,
    getMetadata,
    postMetadata,
} from "../utils/synchronization";

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
        const referenceTypes = _.intersection(_.keys(references), includeRules);
        const promises = referenceTypes
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
    instanceId: string,
    metadataPackage: MetadataPackage,
    encryptionKey: string,
): Promise<SynchronizationResult> {
    const instance = await Instance.get(d2, instanceId);
    const decryptedInstance = instance.decryptPassword(encryptionKey);
    const importResult = await postMetadata(decryptedInstance, metadataPackage);

    // TODO: Update the logger

    return {
        ...importResult.data,
        instance: _.pick(instance, ["id", "name", "url"]),
    };
}

export async function startSynchronization(
    d2: D2,
    builder: SynchronizationBuilder,
    encryptionKey: string,
): Promise<SynchronizationResult[]> {
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
    const exportResults: MetadataPackage[] = await Promise.all(exportPromises);
    const metadataPackage = _.deepMerge({}, ...exportResults);

    // Phase 2: Import metadata into destination instances
    const importPromises = builder.targetInstances.map(instanceId =>
        importMetadata(d2, instanceId, metadataPackage, encryptionKey)
    );

    return Promise.all(importPromises);
}
