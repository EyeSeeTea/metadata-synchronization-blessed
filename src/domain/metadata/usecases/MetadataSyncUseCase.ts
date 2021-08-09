import _ from "lodash";
import memoize from "nano-memoize";
import { modelFactory } from "../../../models/dhis/factory";
import { ExportBuilder } from "../../../types/synchronization";
import { promiseMap } from "../../../utils/common";
import { debug } from "../../../utils/debug";
import { Ref } from "../../common/entities/Ref";
import { Instance } from "../../instance/entities/Instance";
import { MappingMapper } from "../../mapping/helpers/MappingMapper";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { GenericSyncUseCase } from "../../synchronization/usecases/GenericSyncUseCase";
import { Document, MetadataEntities, MetadataPackage, Program } from "../entities/MetadataEntities";
import { NestedRules } from "../entities/MetadataExcludeIncludeRules";
import { buildNestedRules, cleanObject, cleanReferences, getAllReferences } from "../utils";

export class MetadataSyncUseCase extends GenericSyncUseCase {
    public readonly type = "metadata";

    public async exportMetadata(originalBuilder: ExportBuilder): Promise<MetadataPackage> {
        const recursiveExport = async (builder: ExportBuilder): Promise<MetadataPackage> => {
            const { type, ids, excludeRules, includeRules, includeSharingSettings, removeOrgUnitReferences } = builder;

            //TODO: when metadata entities schema exists on domain, move this factory to domain
            const collectionName = modelFactory(type).getCollectionName();
            const schema = this.api.models[collectionName].schema;
            const result: MetadataPackage = {};

            // Each level of recursion traverse the exclude/include rules with nested values
            const nestedExcludeRules: NestedRules = buildNestedRules(excludeRules);
            const nestedIncludeRules: NestedRules = buildNestedRules(includeRules);

            // Get all the required metadata
            const metadataRepository = await this.getMetadataRepository();
            const syncMetadata = await metadataRepository.getMetadataByIds(ids);
            const elements = syncMetadata[collectionName] || [];

            for (const element of elements) {
                //ProgramRules is not included in programs items in the response by the dhis2 API
                //we request it manually and insert it in the element
                const fixedElement =
                    type === "programs" ? await this.requestAndIncludeProgramRules(element as Program) : element;

                // Store metadata object in result
                const object = cleanObject(
                    this.api,
                    schema.name,
                    fixedElement,
                    excludeRules,
                    includeSharingSettings,
                    removeOrgUnitReferences
                );

                result[collectionName] = result[collectionName] || [];
                result[collectionName]?.push(object);

                // Get all the referenced metadata
                const references = getAllReferences(this.api, object, schema.name);
                const includedReferences = cleanReferences(references, includeRules);

                const partialResults = await promiseMap(includedReferences, type =>
                    recursiveExport({
                        type: type as keyof MetadataEntities,
                        ids: references[type],
                        excludeRules: nestedExcludeRules[type],
                        includeRules: nestedIncludeRules[type],
                        includeSharingSettings,
                        removeOrgUnitReferences,
                    })
                );

                _.deepMerge(result, ...partialResults);
            }

            // Clean up result from duplicated elements
            return _.mapValues(result, objects => _.uniqBy(objects, "id"));
        };
        return recursiveExport(originalBuilder);
    }

    public buildPayload = memoize(async () => {
        const { metadataIds, syncParams, filterRules = [] } = this.builder;
        const {
            includeSharingSettings = true,
            removeOrgUnitReferences = false,
            metadataIncludeExcludeRules = {},
            useDefaultIncludeExclude = {},
        } = syncParams ?? {};

        const metadataRepository = await this.getMetadataRepository();
        const filterRulesIds = await metadataRepository.getByFilterRules(filterRules);
        const allMetadataIds = _.union(metadataIds, filterRulesIds);
        const metadata = await metadataRepository.getMetadataByIds<Ref>(allMetadataIds, "id,type"); //type is required to transform visualizations to charts and report tables

        const exportResults = await promiseMap(_.keys(metadata), type => {
            const myClass = modelFactory(type);
            const metadataType = myClass.getMetadataType();
            const collectionName = myClass.getCollectionName();

            return this.exportMetadata({
                type: collectionName,
                ids: metadata[collectionName]?.map(e => e.id) || [],
                excludeRules: useDefaultIncludeExclude
                    ? myClass.getExcludeRules()
                    : metadataIncludeExcludeRules[metadataType].excludeRules.map(_.toPath),
                includeRules: useDefaultIncludeExclude
                    ? myClass.getIncludeRules()
                    : metadataIncludeExcludeRules[metadataType].includeRules.map(_.toPath),
                includeSharingSettings,
                removeOrgUnitReferences,
            });
        });

        const metadataPackage: MetadataPackage = _.deepMerge({}, ...exportResults);
        const metadataWithoutDuplicates: MetadataPackage = _.mapValues(metadataPackage, elements =>
            _.uniqBy(elements, "id")
        );

        const { organisationUnits, users, ...rest } = metadataWithoutDuplicates;

        const finalMetadataPackage = {
            organisationUnits: !syncParams?.removeOrgUnitObjects ? organisationUnits : undefined,
            users: !syncParams?.removeUserObjects ? users : undefined,
            ...rest,
        };

        debug("Metadata package", finalMetadataPackage);
        return finalMetadataPackage;
    });

    public async postPayload(instance: Instance): Promise<SynchronizationResult[]> {
        const { syncParams } = this.builder;

        const originalPayload = await this.buildPayload();

        const payloadWithDocumentFiles = await this.createDocumentFilesInRemote(instance, originalPayload);

        const payload = await this.mapPayload(instance, payloadWithDocumentFiles);

        debug("Metadata package", { originalPayload, payload });

        const remoteMetadataRepository = await this.getMetadataRepository(instance);
        const syncResult = await remoteMetadataRepository.save(payload, syncParams);
        const origin = await this.getOriginInstance();

        return [{ ...syncResult, origin: origin.toPublicObject(), payload }];
    }

    public async buildDataStats() {
        return undefined;
    }

    public async mapPayload(instance: Instance, payload: MetadataPackage): Promise<MetadataPackage> {
        const { syncParams } = this.builder;

        if (syncParams?.enableMapping) {
            const metadataRepository = await this.getMetadataRepository();
            const remoteMetadataRepository = await this.getMetadataRepository(instance);

            const originCategoryOptionCombos = await metadataRepository.getCategoryOptionCombos();
            const destinationCategoryOptionCombos = await remoteMetadataRepository.getCategoryOptionCombos();
            const mapping = await this.getMapping(instance);

            const mapper = new MappingMapper(mapping, originCategoryOptionCombos, destinationCategoryOptionCombos);

            return mapper.applyMapping(payload);
        } else {
            return payload;
        }
    }

    public async createDocumentFilesInRemote(instance: Instance, payload: MetadataPackage): Promise<MetadataPackage> {
        if (!payload.documents) return payload;

        const fileRepository = await this.getInstanceFileRepository();
        const fileRemoteRepository = await this.getInstanceFileRepository(instance);

        const documents = await promiseMap(payload.documents as Document[], async (document: Document) => {
            if (document.external) return document;

            const file = await fileRepository.getById(document.id);
            const fileId = await fileRemoteRepository.save(file);
            return { ...document, url: fileId };
        });

        return { ...payload, documents };
    }

    private async requestAndIncludeProgramRules(program: Program) {
        const metadataRepository = await this.getMetadataRepository();
        const programRules = await metadataRepository.listAllMetadata({
            type: "programRules",
            fields: { id: true },
            program: program.id,
        });
        return { ...program, programRules };
    }
}
