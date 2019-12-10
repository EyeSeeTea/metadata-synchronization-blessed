import i18n from "@dhis2/d2-i18n";
import { D2Api } from "d2-api";
import _ from "lodash";
import { d2ModelFactory } from "../models/d2ModelFactory";
import Instance from "../models/instance";
import SyncReport from "../models/syncReport";
import SyncRule from "../models/syncRule";
import { D2, DataImportStatus, MetadataImportStatus } from "../types/d2";
import {
    ExportBuilder,
    MetadataPackage,
    NestedRules,
    SynchronizationBuilder,
    SynchronizationReportStatus,
    SynchronizationState,
} from "../types/synchronization";
import "../utils/lodash-mixins";
import {
    buildNestedRules,
    cleanDataImportResponse,
    cleanMetadataImportResponse,
    cleanObject,
    cleanReferences,
    getAllReferences,
    getData,
    getMetadata,
    postData,
    postMetadata,
} from "../utils/synchronization";

async function exportMetadata(d2: D2, originalBuilder: ExportBuilder): Promise<MetadataPackage> {
    const visitedIds: Set<string> = new Set();
    const recursiveExport = async (builder: ExportBuilder): Promise<MetadataPackage> => {
        const { type, ids, excludeRules, includeRules, includeSharingSettings } = builder;
        const model = d2ModelFactory(d2, type).getD2Model(d2);
        const result: MetadataPackage = {};

        // Each level of recursion traverse the exclude/include rules with nested values
        const nestedExcludeRules: NestedRules = buildNestedRules(excludeRules);
        const nestedIncludeRules: NestedRules = buildNestedRules(includeRules);

        // Get all the required metadata
        const { baseUrl } = d2.Api.getApi();
        const syncMetadata = await getMetadata(baseUrl, ids);
        const elements = syncMetadata[model.plural] || [];

        for (const element of elements) {
            // Store metadata object in result
            const object = cleanObject(element, excludeRules, includeSharingSettings);
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
                    includeSharingSettings,
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

export async function* startMetadataSynchronization(
    d2: D2,
    _api: D2Api,
    builder: SynchronizationBuilder
): AsyncIterableIterator<SynchronizationState> {
    const { targetInstances: targetInstanceIds, metadataIds, syncRule, syncParams = {} } = builder;
    const { baseUrl } = d2.Api.getApi();

    // Phase 1: Export and package metadata from origin instance
    console.debug("Start metadata synchronization process");
    yield { message: i18n.t("Fetching metadata from origin instance") };
    const metadata = await getMetadata(baseUrl, metadataIds, "id");
    const exportPromises = _.keys(metadata)
        .map(type => {
            const myClass = d2ModelFactory(d2, type);
            return {
                type,
                ids: metadata[type].map(e => e.id),
                excludeRules: myClass.getExcludeRules(),
                includeRules: myClass.getIncludeRules(),
                includeSharingSettings: !!syncParams.includeSharingSettings,
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
        type: "metadata",
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
        console.debug("Start import on destination instance", instance.toObject());
        const response = await postMetadata(instance, metadataPackage, syncParams);

        syncReport.addSyncResult(cleanMetadataImportResponse(response, instance));
        console.debug("Finished importing metadata on instance", instance.toObject());
        yield { syncReport };
    }

    // Phase 4: Update sync rule last executed date
    if (syncRule) {
        const oldRule = await SyncRule.get(d2, syncRule);
        const updatedRule = oldRule.updateLastExecuted(new Date());
        await updatedRule.save(d2);
    }

    // Phase 5: Update parent task status
    syncReport.setStatus(syncReport.hasErrors() ? "FAILURE" : "DONE");
    yield { syncReport, done: true };

    return syncReport;
}

export async function* startDataSynchronization(
    d2: D2,
    api: D2Api,
    builder: SynchronizationBuilder
): AsyncIterableIterator<SynchronizationState> {
    const { metadataIds, targetInstances: targetInstanceIds, syncRule, dataParams = {} } = builder;
    const { baseUrl } = d2.Api.getApi();

    // Phase 1: Obtain metadata related to builder ids
    console.debug("Start data synchronization process");
    yield { message: i18n.t("Fetching metadata from origin instance") };
    const metadataPackage = await getMetadata(
        baseUrl,
        metadataIds,
        "id,dataSetElements,dataElementGroups"
    );
    console.debug("Metadata package from origin instance done", metadataPackage);

    // Phase 2: Retrieve direct data values from dataSets and dataElementGroups
    yield { message: i18n.t("Fetching data from data sets and data element groups") };
    const { dataSets = [], dataElementGroups = [], dataElementGroupSets = [] } = metadataPackage;
    const dataSetIds = dataSets.map(({ id }) => id);
    const dataElementGroupIds = dataElementGroups.map(({ id }) => id);
    const dataElementGroupSetIds = dataElementGroupSets.map(({ dataElementGroups }) =>
        dataElementGroups.map(({ id }: any) => id)
    );
    //@ts-ignore
    const { dataValues: directDataValues = [] } = await getData(
        api,
        dataParams,
        dataSetIds,
        _([...dataElementGroupIds, ...dataElementGroupSetIds])
            .flatten()
            .uniq()
            .value()
    );

    // Phase 3: Retrieve indirect data values from dataElements
    yield { message: i18n.t("Fetching data from data elements") };
    const { dataElements = [] } = metadataPackage;
    //@ts-ignore
    const { dataValues: candidateDataValues = [] } = await getData(
        api,
        dataParams,
        dataElements.map(de => de.dataSetElements.map((dse: any) => dse.dataSet.id)),
        dataElements.map(de => de.dataElementGroups.map((deg: any) => deg.id))
    );
    const indirectDataValues = _.filter(candidateDataValues, ({ dataElement }) =>
        _.find(dataElements, { id: dataElement })
    );

    // Phase 4: Import data into destination instances
    const dataValues = _.uniqWith([...directDataValues, ...indirectDataValues], _.isEqual);

    yield { message: i18n.t("Retrieving information from remote instances") };
    const targetInstances: Instance[] = await Promise.all(
        targetInstanceIds.map(id => Instance.get(d2, id))
    );

    const syncReport = SyncReport.build({
        user: d2.currentUser.username,
        types: _.keys(metadataPackage),
        status: "RUNNING" as SynchronizationReportStatus,
        syncRule,
        type: "aggregated",
    });
    syncReport.addSyncResult(
        ...targetInstances.map(instance => ({
            instance: instance.toObject(),
            status: "PENDING" as DataImportStatus,
            date: new Date(),
        }))
    );
    yield { syncReport };

    for (const instance of targetInstances) {
        yield {
            message: i18n.t("Importing data in instance {{instance}}", {
                instance: instance.name,
            }),
        };
        console.debug("Start import on destination instance", instance.toObject());
        const response = await postData(instance, { dataValues });

        syncReport.addSyncResult(cleanDataImportResponse(response, instance));
        console.debug("Finished importing data on instance", instance.toObject());
        yield { syncReport };
    }

    // Phase 4: Update sync rule last executed date
    if (syncRule) {
        const oldRule = await SyncRule.get(d2, syncRule);
        const updatedRule = oldRule.updateLastExecuted(new Date());
        await updatedRule.save(d2);
    }

    // Phase 5: Update parent task status
    syncReport.setStatus(syncReport.hasErrors() ? "FAILURE" : "DONE");
    yield { syncReport, done: true };

    return syncReport;
}
