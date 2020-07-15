import _ from "lodash";
import { Instance } from "../../domain/instance/entities/Instance";
import {
    MetadataEntities,
    MetadataEntity,
    MetadataFieldsPackage,
    MetadataPackage,
} from "../../domain/metadata/entities/MetadataEntities";
import { MetadataRepository } from "../../domain/metadata/repositories/MetadataRepository";
import { MetadataImportParams } from "../../domain/metadata/types";
import { getClassName } from "../../domain/metadata/utils";
import { SynchronizationResult } from "../../domain/synchronization/entities/SynchronizationResult";
import { TransformationRepository } from "../../domain/transformations/repositories/TransformationRepository";
import {
    D2Api,
    D2ApiDefinition,
    D2Model,
    D2ModelSchemas,
    Id,
    MetadataResponse,
    Model,
    Stats,
} from "../../types/d2-api";
import { cache } from "../../utils/cache";
import {
    metadataTransformationsFromDhis2,
    metadataTransformationsToDhis2,
} from "../transformations/PackageTransformations";

export class MetadataD2ApiRepository implements MetadataRepository {
    private api: D2Api;

    constructor(instance: Instance, private transformationRepository: TransformationRepository) {
        this.api = new D2Api({ baseUrl: instance.url, auth: instance.auth });
    }

    /**
     * Return raw specific fields of metadata dhis2 models according to ids filter
     * @param ids metadata ids to retrieve
     */
    public async getMetadataFieldsByIds<T>(
        ids: string[],
        fields: string,
        targetInstance?: Instance
    ): Promise<MetadataFieldsPackage<T>> {
        return this.getMetadata<T>(ids, fields, targetInstance);
    }

    /**
     * Return metadata entities by type. Realize mapping from d2 to domain
     * TODO: this method is not used for the moment, only is created as template
     * - create object options in domain with (order, filters, paging ....)
     * - Create domain pager?
     */
    public async getMetadataByType(type: keyof MetadataEntities): Promise<MetadataEntity[]> {
        const apiModel = this.getApiModel(type);

        const responseData = await apiModel
            .get({
                paging: false,
                fields: { $owner: true },
            })
            .getData();

        const apiVersion = await this.getVersion();

        const metadataPackage = this.transformationRepository.mapPackageFrom(
            apiVersion,
            responseData,
            metadataTransformationsFromDhis2
        );

        return metadataPackage[type] || [];
    }

    /**
     * Return metadata entities according to ids filter. Realize mapping from d2 to domain
     * @param ids metadata ids to retrieve
     */
    public async getMetadataByIds(ids: string[]): Promise<MetadataPackage> {
        const d2Metadata = await this.getMetadata<D2Model>(ids);

        const apiVersion = await this.getVersion();

        const metadataPackage = this.transformationRepository.mapPackageFrom(
            apiVersion,
            d2Metadata,
            metadataTransformationsFromDhis2
        );

        return metadataPackage;
    }

    public async save(
        metadata: MetadataPackage,
        additionalParams: MetadataImportParams,
        targetInstance: Instance
    ): Promise<SynchronizationResult> {
        const apiVersion = await this.getVersion(targetInstance);
        const versionedPayloadPackage = this.transformationRepository.mapPackageTo(
            apiVersion,
            metadata,
            metadataTransformationsToDhis2
        );

        console.debug("Versioned metadata package", versionedPayloadPackage);

        const response = await this.postMetadata(
            versionedPayloadPackage,
            additionalParams,
            targetInstance
        );

        return this.cleanMetadataImportResponse(response, targetInstance, "metadata");
    }

    public async remove(
        metadata: MetadataFieldsPackage<{ id: Id }>,
        additionalParams: MetadataImportParams,
        targetInstance: Instance
    ): Promise<SynchronizationResult> {
        const response = await this.postMetadata(
            metadata,
            {
                ...additionalParams,
                importStrategy: "DELETE",
            },
            targetInstance
        );

        return this.cleanMetadataImportResponse(response, targetInstance, "deleted");
    }

    private cleanMetadataImportResponse(
        importResult: MetadataResponse,
        instance: Instance,
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
            instance: instance.toObject(),
            errors: messages,
            date: new Date(),
            type,
        };
    }

    private async postMetadata(
        payload: Partial<Record<string, unknown[]>>,
        additionalParams?: MetadataImportParams,
        targetInstance?: Instance
    ): Promise<MetadataResponse> {
        const response = await this.getApi(targetInstance)
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

    private getApi(targetInstance?: Instance): D2Api {
        const { url, username, password } = targetInstance ?? {};
        const auth = username && password ? { username, password } : undefined;
        return targetInstance ? new D2Api({ baseUrl: url, auth }) : this.api;
    }

    @cache()
    private async getVersion(targetInstance?: Instance): Promise<number> {
        if (!targetInstance) {
            const version = await this.api.getVersion();
            return Number(version.split(".")[1]);
        } else if (targetInstance.apiVersion) {
            return targetInstance.apiVersion;
        } else {
            throw Error("Necessary api version to apply transformations to package is undefined");
        }
    }

    private async getMetadata<T>(
        elements: string[],
        fields = ":all",
        targetInstance?: Instance
    ): Promise<Record<string, T[]>> {
        const promises = [];
        for (let i = 0; i < elements.length; i += 100) {
            const requestElements = elements.slice(i, i + 100).toString();
            promises.push(
                this.getApi(targetInstance)
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

    private getApiModel(type: keyof D2ModelSchemas): InstanceType<typeof Model> {
        const modelCollection = this.api.models as {
            [ModelKey in keyof D2ApiDefinition["schemas"]]: Model<
                D2ApiDefinition,
                D2ApiDefinition["schemas"][ModelKey]
            >;
        };
        return modelCollection[type];
    }
}

const formatStats = (stats: Stats) => ({
    ..._.omit(stats, ["created"]),
    imported: stats.created,
});
