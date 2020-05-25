import { MetadataRepository } from "../../../domain/metadata/MetadataRepositoriy";
import {
    MetadataImportResponse,
    MetadataImportParams
} from "../../../domain/metadata/Types";

import { AxiosError } from "axios";
import Instance from "../../../domain/instance/Instance";

import { D2Api, D2Model, D2ModelSchemas, D2ApiDefinition, Model } from "../../../types/d2-api"
import { MetadataPackage, MetadataFieldsPackage, MetadataPackageSchema, MetadataEntity } from "../../../domain/metadata/entities";
import _ from "lodash";
import { metadataTransformationsToDhis2, metadataTransformationsFromDhis2 } from "../mappers/PackageTransformations";
import { mapPackageToD2, mapD2PackageToDomain } from "../mappers/PackageMapper";

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
    async getMetadataFieldsByIds<T>(ids: string[], fields: string): Promise<MetadataFieldsPackage<T>> {
        return this.getMetadata<T>(ids, fields);
    }

    /**
     * Return metadata entitites according to ids filter. Realize mapping from d2 to domain
     * TODO: this method is not used for the moment, only is created as template 
     * - create object options in domain with (order, filters, paging ....)
     * - Create domain pager?
     */
    async getModelByType(type: keyof MetadataPackageSchema): Promise<MetadataEntity[]> {
        const apiModel = this.getApiModel(type);

        const responseData = await apiModel.get({
            paging: false,
            fields: { $owner: true },
        }).getData();

        const apiVersion = await this.getVersion();

        const metadataPackage = mapD2PackageToDomain(apiVersion, responseData, metadataTransformationsFromDhis2);

        return metadataPackage["objects"];
    }

    /**
     * Return metadata entitites according to ids filter. Realize mapping from d2 to domain
     * @param ids metadata ids to retrieve
     */
    async getMetadataByIds(ids: string[]): Promise<MetadataPackage> {
        const d2Metadata = await this.getMetadata<D2Model>(ids);

        const apiVersion = await this.getVersion();

        const metadataPackage = mapD2PackageToDomain(apiVersion, d2Metadata, metadataTransformationsFromDhis2);

        debugger;
        return metadataPackage;
    }

    async save(metadata: MetadataPackage,
        additionalParams?: MetadataImportParams,
        targetInstance?: Instance): Promise<MetadataImportResponse> {

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

            const apiVersion = await this.getVersion(targetInstance);
            const versionedPayloadPackage = mapPackageToD2(apiVersion, metadata, metadataTransformationsToDhis2);

            console.debug("Versioned metadata package", versionedPayloadPackage);

            const response = await this.getApi(targetInstance)
                .post("/metadata", params, versionedPayloadPackage).getData();

            return response as MetadataImportResponse;
        } catch (error) {
            return this.buildResponseError(error);
        }
    }

    private getApi(targetInstance?: Instance): D2Api {
        return targetInstance ? new D2Api({
            baseUrl: targetInstance.url,
            auth: { username: targetInstance.username, password: targetInstance.password }
        }) : this.currentD2Api;
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
        fields = ":all"
    ): Promise<Record<string, T[]>> {
        const promises = [];
        for (let i = 0; i < elements.length; i += 100) {
            const requestElements = elements.slice(i, i + 100).toString();
            promises.push(
                this.currentD2Api
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
            [ModelKey in keyof D2ApiDefinition["schemas"]]: Model<D2ApiDefinition, D2ApiDefinition["schemas"][ModelKey]>;
        };
        return modelCollection[type];
    }
}

export default MetadataD2ApiRepository;