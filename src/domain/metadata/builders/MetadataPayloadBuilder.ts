import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationBuilder } from "../../synchronization/entities/SynchronizationBuilder";
import { MetadataEntities, MetadataEntity, MetadataPackage, Program } from "../entities/MetadataEntities";

import { debug } from "../../../utils/debug";
import { DataStoreMetadata } from "../../data-store/DataStoreMetadata";
import { Ref } from "../../common/entities/Ref";
import { promiseMap } from "../../../utils/common";
import { defaultName, modelFactory } from "../../../models/dhis/factory";
import { cache } from "../../../utils/cache";
import { ExportBuilder } from "../../../types/synchronization";
import { D2Api, Id } from "../../../types/d2-api";
import { getD2APiFromInstance } from "../../../utils/d2-utils";
import _ from "lodash";
import { NestedRules } from "../entities/MetadataExcludeIncludeRules";
import { buildNestedRules, cleanObject, cleanReferences, getAllReferences } from "../utils";

export class MetadataPayloadBuilder {
    private api: D2Api;
    private idsAlreadyRequested = new Set<Id>();

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
            useDefaultIncludeExclude = {},
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
            ...rest
        } = metadataWithoutDuplicates;

        const removeCategoryObjects = !!syncParams?.removeDefaultCategoryObjects;

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
            organisationUnits: includeOrgUnitsObjectsAndReferences ? organisationUnits : undefined,
            users: includeUsersObjectsAndReferences ? users : undefined,
            userGroups: includeSharingSettingsObjectsAndReferences ? userGroups : undefined,
            userRoles: includeSharingSettingsObjectsAndReferences ? userRoles : undefined,
            ...rest,
        };

        this.idsAlreadyRequested.clear();

        debug("Metadata package", finalMetadataPackage);
        return finalMetadataPackage;
    }

    @cache()
    public async getOriginInstance(originInstanceId: string): Promise<Instance> {
        const instance = await this.getInstanceById(originInstanceId);

        if (!instance) throw new Error("Unable to read origin instance");
        return instance;
    }

    private async getInstanceById(id: string): Promise<Instance | undefined> {
        const instance = await this.repositoryFactory.instanceRepository(this.localInstance).getById(id);
        if (!instance) return undefined;

        try {
            const version = await this.repositoryFactory.instanceRepository(instance).getVersion();
            return instance.update({ version });
        } catch (error: any) {
            return instance;
        }
    }

    public async exportMetadata(originalBuilder: ExportBuilder, originInstanceId: string): Promise<MetadataPackage> {
        const recursiveExport = async (builder: ExportBuilder): Promise<MetadataPackage> => {
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

            const newIds = ids.filter(id => !this.idsAlreadyRequested.has(id));

            if (newIds.length === 0) {
                return {};
            }

            //TODO: when metadata entities schema exists on domain, move this factory to domain
            const collectionName = modelFactory(type).getCollectionName();
            const schema = this.api.models[collectionName].schema;
            const result: MetadataPackage = {};

            // Each level of recursion traverse the exclude/include rules with nested values
            const nestedExcludeRules: NestedRules = buildNestedRules(excludeRules);
            const nestedIncludeReferencesAndObjectsRules: NestedRules = buildNestedRules(
                includeReferencesAndObjectsRules
            );

            // Get all the required metadata
            const originInstance = await this.getOriginInstance(originInstanceId);
            const metadataRepository = this.repositoryFactory.metadataRepository(originInstance);
            const syncMetadata = await metadataRepository.getMetadataByIds(newIds);
            const elements = syncMetadata[collectionName] || [];
            newIds.forEach(id => this.idsAlreadyRequested.add(id));

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

                    return recursiveExport({
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
                    });
                });

                _.deepMerge(result, ...partialResults);
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

        return recursiveExport({
            ...originalBuilder,
            includeReferencesAndObjectsRules,
        });
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
}
