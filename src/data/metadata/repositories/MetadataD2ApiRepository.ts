import { AxiosError } from "axios";
import _ from "lodash";
import Instance from "../../../domain/instance/Instance";
import {
    MetadataEntities,
    MetadataEntity,
    MetadataFieldsPackage,
    MetadataPackage,
} from "../../../domain/metadata/entities/MetadataEntities";
import { MetadataRepository } from "../../../domain/metadata/MetadataRepositoriy";
import { MetadataImportParams, MetadataImportResponse } from "../../../domain/metadata/types";
import { D2Api, D2ApiDefinition, D2Model, D2ModelSchemas, Id, Model } from "../../../types/d2-api";
import { mapD2PackageFromD2, mapPackageToD2 } from "../mappers/PackageMapper";
import {
    metadataTransformationsFromDhis2,
    metadataTransformationsToDhis2,
} from "../mappers/PackageTransformations";

class MetadataD2ApiRepository implements MetadataRepository {
    private currentD2Api: D2Api;

    constructor(d2Api: D2Api) {
        //TODO: composition root - when we have composition root I think may has sense
        // that dependency should be currentInstance instead of d2Api because so
        // all necessary instance data (url, usr, pwd, version) for current server is loaded once to start app.
        // For the moment I have not make this change becuase we should realize a request to current server
        // for every metadata sync execution where this class is created to retrieve current version
        this.currentD2Api = d2Api;
    }

    /**
     * Return raw specific fields of metadata dhis2 models according to ids filter
     * @param ids metadata ids to retrieve
     */
    async getMetadataFieldsByIds<T>(
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
    async getMetadataByType(type: keyof MetadataEntities): Promise<MetadataEntity[]> {
        const apiModel = this.getApiModel(type);

        const responseData = await apiModel
            .get({
                paging: false,
                fields: { $owner: true },
            })
            .getData();

        const apiVersion = await this.getVersion();

        const metadataPackage = mapD2PackageFromD2(
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
    async getMetadataByIds(ids: string[]): Promise<MetadataPackage> {
        const d2Metadata = await this.getMetadata<D2Model>(ids);

        const apiVersion = await this.getVersion();

        const metadataPackage = mapD2PackageFromD2(
            apiVersion,
            d2Metadata,
            metadataTransformationsFromDhis2
        );

        return metadataPackage;
    }

    async save(
        metadata: MetadataPackage,
        additionalParams?: MetadataImportParams,
        targetInstance?: Instance
    ): Promise<MetadataImportResponse> {
        const apiVersion = await this.getVersion(targetInstance);
        const versionedPayloadPackage = mapPackageToD2(
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

        return response;
    }

    async remove(
        metadata: MetadataFieldsPackage<{ id: Id }>,
        additionalParams?: MetadataImportParams,
        targetInstance?: Instance
    ): Promise<MetadataImportResponse> {
        const response = await this.postMetadata(
            metadata,
            {
                ...additionalParams,
                importStrategy: "DELETE",
            },
            targetInstance
        );

        return response;
    }

    private async postMetadata(
        payload: Partial<Record<string, unknown[]>>,
        additionalParams?: MetadataImportParams,
        targetInstance?: Instance
    ): Promise<MetadataImportResponse> {
        try {
            const params = {
                importMode: "COMMIT",
                identifier: "UID",
                importReportMode: "FULL",
                importStrategy: "CREATE_AND_UPDATE",
                mergeMode: "MERGE",
                atomicMode: "ALL",
                ...additionalParams,
            };

            const response = await this.getApi(targetInstance)
                .post("/metadata", params, payload)
                .getData();

            return response as MetadataImportResponse;
        } catch (error) {
            return this.buildResponseError(error);
        }
    }

    private getApi(targetInstance?: Instance): D2Api {
        return targetInstance
            ? new D2Api({
                  baseUrl: targetInstance.url,
                  auth: { username: targetInstance.username, password: targetInstance.password },
              })
            : this.currentD2Api;
    }

    private async getVersion(targetInstance?: Instance): Promise<number> {
        if (!targetInstance) {
            const version = await this.currentD2Api.getVersion();
            return +version.split(".")[1];
        } else if (targetInstance.apiVersion) {
            return targetInstance.apiVersion;
        } else {
            throw Error("Necessary api version to apply transformations to package is undefined");
        }
    }

    private buildResponseError(error: AxiosError): MetadataImportResponse {
        if (error.response && error.response.data) {
            const {
                httpStatus = "Unknown",
                httpStatusCode = 400,
                message = "Request failed unexpectedly",
            } = error.response.data;
            return {
                ...error.response.data,
                message: `Error ${httpStatusCode} (${httpStatus}): ${message}`,
            };
        } else if (error.response) {
            const { status, statusText } = error.response;
            console.error(status, statusText, error);
            return { status: "ERROR", message: `Unknown error: ${status} ${statusText}` };
        } else {
            console.error(error);
            return { status: "NETWORK ERROR" };
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
        const modelCollection = this.currentD2Api.models as {
            [ModelKey in keyof D2ApiDefinition["schemas"]]: Model<
                D2ApiDefinition,
                D2ApiDefinition["schemas"][ModelKey]
            >;
        };
        return modelCollection[type];
    }
}

export default MetadataD2ApiRepository;
