import _ from "lodash";
import moment from "moment";
import { Ref } from "../../domain/common/entities/Ref";
import { Instance } from "../../domain/instance/entities/Instance";
import {
    MetadataEntities,
    MetadataEntity,
    MetadataPackage,
} from "../../domain/metadata/entities/MetadataEntities";
import {
    ListMetadataParams,
    ListMetadataResponse,
    MetadataRepository,
} from "../../domain/metadata/repositories/MetadataRepository";
import { MetadataImportParams } from "../../domain/metadata/types";
import { getClassName } from "../../domain/metadata/utils";
import { SynchronizationResult } from "../../domain/synchronization/entities/SynchronizationResult";
import { cleanOrgUnitPaths } from "../../domain/synchronization/utils";
import { TransformationRepository } from "../../domain/transformations/repositories/TransformationRepository";
import { D2Api, D2Model, MetadataResponse, Model, Stats } from "../../types/d2-api";
import { Dictionary } from "../../types/utils";
import { cache } from "../../utils/cache";
import {
    metadataTransformationsFromDhis2,
    metadataTransformationsToDhis2,
} from "../transformations/PackageTransformations";

export class MetadataD2ApiRepository implements MetadataRepository {
    private api: D2Api;

    constructor(
        private instance: Instance,
        private transformationRepository: TransformationRepository
    ) {
        this.api = new D2Api({ baseUrl: instance.url, auth: instance.auth });
    }

    /**
     * Return raw specific fields of metadata dhis2 models according to ids filter
     * @param ids metadata ids to retrieve
     */
    public async getMetadataByIds<T>(ids: string[], fields: string): Promise<MetadataPackage<T>> {
        const { apiVersion } = this.instance;

        const d2Metadata = await this.getMetadata<D2Model>(ids, fields);

        const metadataPackage = this.transformationRepository.mapPackageFrom(
            apiVersion,
            d2Metadata,
            metadataTransformationsFromDhis2
        );

        return metadataPackage as T;
    }

    @cache()
    public async listMetadata({
        type,
        fields = { $owner: true },
        page,
        pageSize,
        ...params
    }: ListMetadataParams): Promise<ListMetadataResponse> {
        const filter = this.buildListFilters(params);
        const { apiVersion } = this.instance;

        const { objects, pager } = await this.getApiModel(type)
            .get({ paging: true, fields, filter, page, pageSize })
            .getData();

        const metadataPackage = this.transformationRepository.mapPackageFrom(
            apiVersion,
            { [type]: objects },
            metadataTransformationsFromDhis2
        );

        return { objects: metadataPackage[type as keyof MetadataEntities] ?? [], pager };
    }

    @cache()
    public async listAllMetadata({
        type,
        fields = { $owner: true },
        ...params
    }: ListMetadataParams): Promise<MetadataEntity[]> {
        const filter = this.buildListFilters(params);
        const { apiVersion } = this.instance;

        const { objects } = await this.getApiModel(type)
            .get({ paging: false, fields, filter })
            .getData();

        const metadataPackage = this.transformationRepository.mapPackageFrom(
            apiVersion,
            { [type]: objects },
            metadataTransformationsFromDhis2
        );

        return metadataPackage[type as keyof MetadataEntities] ?? [];
    }

    private buildListFilters({
        lastUpdated,
        group,
        level,
        parents,
        showOnlySelected,
        selectedIds = [],
        filterRows,
        search,
    }: Partial<ListMetadataParams>) {
        const filter: Dictionary<unknown> = {};

        if (lastUpdated) filter["lastUpdated"] = { ge: moment(lastUpdated).format("YYYY-MM-DD") };
        if (group) filter[`${group.type}.id`] = { eq: group.value };
        if (level) filter["level"] = { eq: level };
        if (parents) filter["parent.id"] = { in: cleanOrgUnitPaths(parents) };
        if (showOnlySelected) filter["id"] = { in: selectedIds };
        if (filterRows) filter["id"] = { in: filterRows };
        if (search) filter[search.field] = { [search.operator]: search.value };

        return filter;
    }

    public async save(
        metadata: MetadataPackage,
        additionalParams: MetadataImportParams
    ): Promise<SynchronizationResult> {
        const { apiVersion } = this.instance;
        const versionedPayloadPackage = this.transformationRepository.mapPackageTo(
            apiVersion,
            metadata,
            metadataTransformationsToDhis2
        );

        console.debug("Versioned metadata package", versionedPayloadPackage);

        const response = await this.postMetadata(versionedPayloadPackage, additionalParams);

        return this.cleanMetadataImportResponse(response, "metadata");
    }

    public async remove(
        metadata: MetadataPackage<Ref>,
        additionalParams: MetadataImportParams
    ): Promise<SynchronizationResult> {
        const response = await this.postMetadata(metadata, {
            ...additionalParams,
            importStrategy: "DELETE",
        });

        return this.cleanMetadataImportResponse(response, "deleted");
    }

    private cleanMetadataImportResponse(
        importResult: MetadataResponse,
        type: "metadata" | "deleted"
    ): SynchronizationResult {
        const { status, stats, typeReports = [] } = importResult;
        const typeStats = typeReports.flatMap(({ klass, stats }) => ({
            ...formatStats(stats),
            type: getClassName(klass),
        }));

        const messages = typeReports.flatMap(({ objectReports = [] }) =>
            objectReports.flatMap(({ uid: id, errorReports = [] }) =>
                _.take(errorReports, 1).map(({ mainKlass, errorProperty, message }) => ({
                    id,
                    type: getClassName(mainKlass),
                    property: errorProperty,
                    message: message,
                }))
            )
        );

        return {
            status: status === "OK" ? "SUCCESS" : status,
            stats: formatStats(stats),
            typeStats,
            instance: this.instance.toPublicObject(),
            errors: messages,
            date: new Date(),
            type,
        };
    }

    private async postMetadata(
        payload: Partial<Record<string, unknown[]>>,
        additionalParams?: MetadataImportParams
    ): Promise<MetadataResponse> {
        const response = await this.api
            .post<MetadataResponse>(
                "/metadata",
                {
                    importMode: "COMMIT",
                    identifier: "UID",
                    importReportMode: "FULL",
                    importStrategy: "CREATE_AND_UPDATE",
                    mergeMode: "MERGE",
                    atomicMode: "ALL",
                    ...additionalParams,
                },
                payload
            )
            .getData();

        return response;
    }

    private async getMetadata<T>(
        elements: string[],
        fields = ":all"
    ): Promise<Record<string, T[]>> {
        const promises = [];
        for (let i = 0; i < elements.length; i += 100) {
            const requestElements = elements.slice(i, i + 100).toString();
            promises.push(
                this.api
                    .get("/metadata", {
                        fields,
                        filter: "id:in:[" + requestElements + "]",
                        defaults: "EXCLUDE",
                    })
                    .getData()
            );
        }
        const response = await Promise.all(promises);
        const results = _.deepMerge({}, ...response);
        if (results.system) delete results.system;
        return results;
    }

    private getApiModel(type: keyof MetadataEntities): InstanceType<typeof Model> {
        return this.api.models[type];
    }
}

const formatStats = (stats: Stats) => ({
    ..._.omit(stats, ["created"]),
    imported: stats.created,
});
