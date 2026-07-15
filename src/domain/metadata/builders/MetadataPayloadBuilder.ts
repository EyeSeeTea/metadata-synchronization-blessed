import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationBuilder } from "../../synchronization/entities/SynchronizationBuilder";
import {
    Dashboard,
    EventVisualization,
    MetadataEntities,
    MetadataEntity,
    MetadataPackage,
    Program,
    Visualization,
} from "../entities/MetadataEntities";

import { debug } from "../../../utils/debug";
import { DataStoreMetadata } from "../../data-store/DataStoreMetadata";
import { Ref } from "../../common/entities/Ref";
import { promiseMap } from "../../../utils/common";
import { defaultName, modelFactory } from "../../../models/dhis/factory";
import { cache } from "../../../utils/cache";
import { ExportBuilder } from "../../../types/synchronization";
import { D2Api, getApiModel } from "../../../types/d2-api";
import { getD2APiFromInstance } from "../../../utils/d2-utils";
import _ from "lodash";
import { NestedRules } from "../entities/MetadataExcludeIncludeRules";
import { buildNestedRules, cleanObject, cleanReferences, getAllReferences } from "../utils";
import { BuilderRegistry } from "./BuilderRegistry";

export class MetadataPayloadBuilder {
    private api: D2Api;
    private registry = new BuilderRegistry();
    private debugEnabled = false;

    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {
        this.api = getD2APiFromInstance(localInstance);
    }

    public async build(syncBuilder: SynchronizationBuilder): Promise<MetadataPackage> {
        const { metadataIds, syncParams, filterRules = [], originInstance: originInstanceId } = syncBuilder;
        const {
            includeSharingSettingsObjectsAndReferences = true,
            includeOnlySharingSettingsReferences = false,
            includeUsersObjectsAndReferences = true,
            includeOnlyUsersReferences = false,
            includeOrgUnitsObjectsAndReferences = true,
            includeOnlyOrgUnitsReferences = false,
            removeUserNonEssentialObjects = false,
            metadataIncludeExcludeRules = {},
            useDefaultIncludeExclude = true,
        } = syncParams ?? {};

        const originInstance = await this.getOriginInstance(originInstanceId);
        const metadataRepository = this.repositoryFactory.metadataRepository(originInstance);

        const filterRulesIds = await metadataRepository.getByFilterRules(filterRules);
        const allMetadataIds = [...metadataIds, ...filterRulesIds];

        const idsWithoutDataStore = allMetadataIds.filter(id => !DataStoreMetadata.isDataStoreId(id));
        const metadata = await metadataRepository.getMetadataByIds<Ref>(idsWithoutDataStore, "id,type"); //type is required to transform visualizations to charts and report tables

        const metadataWithSyncAll: Partial<Record<keyof MetadataEntities, Ref[]>> = await Promise.all(
            (syncParams?.metadataModelsSyncAll ?? []).map(
                async type =>
                    await metadataRepository
                        .listAllMetadata({ type: type as keyof MetadataEntities, fields: { id: true, type: true } })
                        .then(metadata => ({
                            [type]: metadata,
                        }))
            )
        ).then(syncAllMetadata => _.deepMerge(metadata, ...syncAllMetadata)); //TODO: don't mix async/.then 963#discussion_r1682376524

        const exportResults = await promiseMap(_.keys(metadataWithSyncAll), type => {
            const myClass = modelFactory(type);
            const metadataType = myClass.getMetadataType();
            const collectionName = myClass.getCollectionName();
            const userIncludeReferencesAndObjectsRules = modelFactory("user").getIncludeRules();
            const userGroupIncludeReferencesAndObjectsRules = modelFactory("userGroup").getIncludeRules();

            if (metadataType === defaultName) return Promise.resolve({});

            const sharingSettingsIncludeReferencesAndObjectsRules =
                includeSharingSettingsObjectsAndReferences || includeOnlySharingSettingsReferences
                    ? [...userIncludeReferencesAndObjectsRules, ...userGroupIncludeReferencesAndObjectsRules]
                    : [];

            const usersIncludeReferencesAndObjectsRules =
                includeUsersObjectsAndReferences || includeOnlyUsersReferences
                    ? userIncludeReferencesAndObjectsRules
                    : [];

            return this.exportMetadata(
                {
                    type: collectionName,
                    ids: metadataWithSyncAll[collectionName]?.map(e => e.id) || [],
                    excludeRules: useDefaultIncludeExclude
                        ? myClass.getExcludeRules()
                        : metadataIncludeExcludeRules[metadataType].excludeRules.map(_.toPath),
                    includeReferencesAndObjectsRules: useDefaultIncludeExclude
                        ? myClass.getIncludeRules()
                        : metadataIncludeExcludeRules[metadataType].includeReferencesAndObjectsRules.map(_.toPath),
                    includeSharingSettingsObjectsAndReferences,
                    includeOnlySharingSettingsReferences,
                    includeUsersObjectsAndReferences,
                    includeOnlyUsersReferences,
                    includeOrgUnitsObjectsAndReferences,
                    includeOnlyOrgUnitsReferences,
                    sharingSettingsIncludeReferencesAndObjectsRules,
                    usersIncludeReferencesAndObjectsRules,
                    removeUserNonEssentialObjects,
                },
                originInstanceId
            );
        });

        const metadataPackage: MetadataPackage = _.deepMerge({}, ...exportResults);
        const metadataWithoutDuplicates: MetadataPackage = _.mapValues(metadataPackage, elements =>
            _.uniqBy(elements, "id")
        );

        const {
            organisationUnits,
            users,
            userGroups,
            userRoles,
            categories,
            categoryCombos,
            categoryOptions,
            categoryOptionCombos,
            visualizations,
            ...rest
        } = metadataWithoutDuplicates;

        const visualizationsWithRows = visualizations
            ? await this.addRowsToVisualizations(originInstance, visualizations as Visualization[])
            : [];

        const removeCategoryObjects = !!syncParams?.removeDefaultCategoryObjects;

        const includeIfRequestedOrFlagged = (
            key: keyof MetadataEntities,
            value: MetadataEntity[] | undefined,
            flag: boolean
        ): MetadataPackage => (value && (flag || key in metadataWithSyncAll) ? { [key]: value } : {});

        const finalMetadataPackage = {
            ...(categories && { categories: this.excludeDefaultMetadataObjects(categories, removeCategoryObjects) }),
            ...(categoryCombos && {
                categoryCombos: this.excludeDefaultMetadataObjects(categoryCombos, removeCategoryObjects),
            }),
            ...(categoryOptions && {
                categoryOptions: this.excludeDefaultMetadataObjects(categoryOptions, removeCategoryObjects),
            }),
            ...(categoryOptionCombos && {
                categoryOptionCombos: this.excludeDefaultMetadataObjects(categoryOptionCombos, removeCategoryObjects),
            }),
            ...(visualizationsWithRows.length > 0 && { visualizations: visualizationsWithRows }),

            ...includeIfRequestedOrFlagged("organisationUnits", organisationUnits, includeOrgUnitsObjectsAndReferences),
            ...includeIfRequestedOrFlagged("users", users, includeUsersObjectsAndReferences),
            ...includeIfRequestedOrFlagged("userGroups", userGroups, includeSharingSettingsObjectsAndReferences),
            ...includeIfRequestedOrFlagged("userRoles", userRoles, includeSharingSettingsObjectsAndReferences),

            ...rest,
        };

        this.registry.clear();

        debug("Metadata package", finalMetadataPackage);
        return finalMetadataPackage;
    }

    public async buildDataStorePayload(
        syncBuilder: SynchronizationBuilder,
        remoteInstance: Instance
    ): Promise<DataStoreMetadata[]> {
        const { metadataIds, excludedIds, syncParams, originInstance: originInstanceId } = syncBuilder;

        const dataStoreIds = DataStoreMetadata.getDataStoreIds(metadataIds);
        const excludedDataStoreIds = DataStoreMetadata.getDataStoreIds(excludedIds);
        const dataStore = DataStoreMetadata.buildFromKeys(dataStoreIds, excludedDataStoreIds);

        if (dataStore.length === 0) return [];

        const originInstance = await this.getOriginInstance(originInstanceId);
        const dataStoreRepository = this.repositoryFactory.dataStoreMetadataRepository(originInstance);

        const dataStoreRemoteRepository = this.repositoryFactory.dataStoreMetadataRepository(remoteInstance);

        const dataStoreLocal = await dataStoreRepository.get(dataStore);
        const dataStoreRemote = await dataStoreRemoteRepository.get(dataStore);

        const dataStorePayload = DataStoreMetadata.combine(metadataIds, dataStoreLocal, dataStoreRemote, {
            action: syncParams?.mergeMode,
        });

        return syncParams?.includeSharingSettingsObjectsAndReferences ||
            syncParams?.includeOnlySharingSettingsReferences
            ? dataStorePayload
            : DataStoreMetadata.removeSharingSettings(dataStorePayload);
    }

    @cache()
    public async getOriginInstance(originInstanceId: string): Promise<Instance> {
        const instance = await this.repositoryFactory.instanceRepository(this.localInstance).getById(originInstanceId);

        if (!instance) throw new Error("Unable to read origin instance");
        return instance;
    }

    public async exportMetadata(originalBuilder: ExportBuilder, originInstanceId: string): Promise<MetadataPackage> {
        const recursiveExport = async (builder: ExportBuilder, depth = 0): Promise<MetadataPackage> => {
            const {
                type,
                ids,
                excludeRules,
                includeReferencesAndObjectsRules,
                includeSharingSettingsObjectsAndReferences,
                includeOnlySharingSettingsReferences,
                includeUsersObjectsAndReferences,
                includeOnlyUsersReferences,
                includeOrgUnitsObjectsAndReferences,
                includeOnlyOrgUnitsReferences,
                sharingSettingsIncludeReferencesAndObjectsRules,
                usersIncludeReferencesAndObjectsRules,
                removeUserNonEssentialObjects,
            } = builder;

            const newIds = this.registry.filterNotRequested(builder, ids);

            if (newIds.length === 0) {
                return {};
            }

            this.debug(depth, `type=${builder.type}, ids=[${newIds.join(", ")}]`);

            //TODO: when metadata entities schema exists on domain, move this factory to domain
            const collectionName = modelFactory(type).getCollectionName();
            const schema = getApiModel(this.api, collectionName).schema;
            const result: MetadataPackage = {};

            // Each level of recursion traverse the exclude/include rules with nested values
            const nestedExcludeRules: NestedRules = buildNestedRules(excludeRules);
            const nestedIncludeReferencesAndObjectsRules: NestedRules = buildNestedRules(
                includeReferencesAndObjectsRules
            );

            // Get all the required metadata
            const originInstance = await this.getOriginInstance(originInstanceId);
            const metadataRepository = this.repositoryFactory.metadataRepository(originInstance);
            // DataSets need preserveNestedDefaultRefs because the server-side defaults=EXCLUDE
            // strips the default categoryOptionCombo.id from compulsoryDataElementOperands,
            // which then fails on import. Client-side default stripping still runs.
            const syncMetadata =
                type === "dataSets"
                    ? await metadataRepository.getMetadataByIds(newIds, undefined, false, true)
                    : await metadataRepository.getMetadataByIds(newIds);
            const elements = syncMetadata[collectionName] || [];
            this.registry.addList(builder, newIds);

            for (const element of elements) {
                //ProgramRules is not included in programs items in the response by the dhis2 API
                //we request it manually and insert it in the element
                const fixedElement =
                    type === "programs"
                        ? await this.requestAndIncludeProgramRules(element as Program, originInstanceId)
                        : element;

                // Store metadata object in result
                const object = cleanObject({
                    api: this.api,
                    modelName: schema.name,
                    element: fixedElement,
                    excludeRules: excludeRules,
                    includeSharingSettingsObjectsAndReferences,
                    includeOnlySharingSettingsReferences,
                    includeUsersObjectsAndReferences,
                    includeOnlyUsersReferences,
                    includeOrgUnitsObjectsAndReferences,
                    includeOnlyOrgUnitsReferences,
                    removeNonEssentialObjects: removeUserNonEssentialObjects,
                });

                result[collectionName] = result[collectionName] || [];
                result[collectionName]?.push(object);

                // Get all the referenced metadata
                const references = getAllReferences(this.api, object, schema.name);
                const includedReferences = cleanReferences(references, includeReferencesAndObjectsRules);

                const partialResults = await promiseMap(includedReferences, type => {
                    // TODO: Check why nestedIncludeReferencesAndObjectsRules[type] can be undefined
                    const metadataTypeIncludeReferencesAndObjectsRules =
                        nestedIncludeReferencesAndObjectsRules[type] || [];

                    const nextIncludeReferencesAndObjectsRules =
                        (includeSharingSettingsObjectsAndReferences || includeUsersObjectsAndReferences) &&
                        type !== "users" &&
                        type !== "userGroups" &&
                        type !== "userRoles"
                            ? [
                                  ...metadataTypeIncludeReferencesAndObjectsRules,
                                  ...sharingSettingsIncludeReferencesAndObjectsRules,
                                  ...usersIncludeReferencesAndObjectsRules,
                              ]
                            : metadataTypeIncludeReferencesAndObjectsRules;

                    return recursiveExport(
                        {
                            type: type as keyof MetadataEntities,
                            ids: [...new Set(references[type])],
                            excludeRules: nestedExcludeRules[type],
                            includeReferencesAndObjectsRules: nextIncludeReferencesAndObjectsRules,
                            includeSharingSettingsObjectsAndReferences,
                            includeOnlySharingSettingsReferences,
                            includeUsersObjectsAndReferences,
                            includeOnlyUsersReferences,
                            includeOrgUnitsObjectsAndReferences,
                            includeOnlyOrgUnitsReferences,
                            sharingSettingsIncludeReferencesAndObjectsRules,
                            usersIncludeReferencesAndObjectsRules,
                            removeUserNonEssentialObjects,
                        },
                        depth + 1
                    );
                });

                // Line list event visualizations are not included by default when exporting dashboards
                // so we need to request them separately and include them in the metadata package
                const eventVisualizations =
                    type === "dashboards"
                        ? await this.requestAndIncludeLineListings(fixedElement as Dashboard, originInstanceId)
                        : {};

                _.deepMerge(result, ...partialResults, eventVisualizations);
            }

            // Clean up result from duplicated elements
            return _.mapValues(result, objects => _.uniqBy(objects, "id"));
        };

        const currentMetadataTypeIncludeReferencesAndObjectsRules = originalBuilder.includeReferencesAndObjectsRules;

        const includeReferencesAndObjectsRules =
            (originalBuilder.includeSharingSettingsObjectsAndReferences ||
                originalBuilder.includeUsersObjectsAndReferences) &&
            originalBuilder.type !== "users" &&
            originalBuilder.type !== "userGroups" &&
            originalBuilder.type !== "userRoles"
                ? [
                      ...currentMetadataTypeIncludeReferencesAndObjectsRules,
                      ...originalBuilder.sharingSettingsIncludeReferencesAndObjectsRules,
                      ...originalBuilder.usersIncludeReferencesAndObjectsRules,
                  ]
                : currentMetadataTypeIncludeReferencesAndObjectsRules;

        return recursiveExport(
            {
                ...originalBuilder,
                includeReferencesAndObjectsRules,
            },
            0
        );
    }

    private debug(depth: number, ...message: unknown[]) {
        if (!this.debugEnabled) return;
        const indent = "  ".repeat(depth);
        debug(`${indent}[builder]`, ...message);
    }

    private excludeDefaultMetadataObjects(
        metadata: MetadataEntity[] | undefined,
        removeMetadataObjects: boolean
    ): MetadataEntity[] | undefined {
        return removeMetadataObjects && metadata
            ? metadata.filter(metadataObject => metadataObject.name !== "default" || metadataObject.code !== "default")
            : metadata;
    }

    private async requestAndIncludeProgramRules(program: Program, originInstanceId: string) {
        const defaultInstance = await this.getOriginInstance(originInstanceId);
        const metadataRepository = this.repositoryFactory.metadataRepository(defaultInstance);
        const programRules = await metadataRepository.listAllMetadata({
            type: "programRules",
            fields: { id: true },
            program: program.id,
        });
        return { ...program, programRules };
    }

    private async requestAndIncludeLineListings(
        dashboard: Dashboard,
        originInstanceId: string
    ): Promise<{ eventVisualizations: EventVisualization[] }> {
        const defaultInstance = await this.getOriginInstance(originInstanceId);
        const metadataRepository = this.repositoryFactory.metadataRepository(defaultInstance);

        const eventVisualizationIds = _(dashboard.dashboardItems)
            .map(dashboardItem => dashboardItem.eventVisualization?.id)
            .compact()
            .value();
        const eventVisualizations = await metadataRepository.getMetadataByIds<EventVisualization>(
            eventVisualizationIds,
            ":all"
        );
        const lineListVisualizations = Object.values(eventVisualizations)
            .flat()
            .filter(eventVisualization => eventVisualization.type === "LINE_LIST");

        return {
            eventVisualizations: lineListVisualizations,
        };
    }

    private async addRowsToVisualizations(
        originInstance: Instance,
        visualizations: Visualization[]
    ): Promise<Visualization[]> {
        const visualizationsRepository = await this.repositoryFactory.visualizationsRepository(originInstance);
        const visualizationIds = visualizations.map(visualization => visualization.id);

        const visualizationsWithRows = await visualizationsRepository.getByIds(visualizationIds);

        return visualizations.map(visualization => {
            const rows = visualizationsWithRows.find(row => row.id === visualization.id)?.rows || [];
            return { ...visualization, rows };
        });
    }
}
