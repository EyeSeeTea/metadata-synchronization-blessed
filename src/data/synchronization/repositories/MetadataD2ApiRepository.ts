import { MetadataRepository } from "../../../domain/synchronization/MetadataRepositoriy";
import {
    MetadataPackage,
    MetadataImportResponse,
    MetadataImportParams
} from "../../../domain/synchronization/MetadataEntities";
import { D2Api, D2ApiDefault } from "d2-api";
import { AxiosError } from "axios";
import Instance from "../../../domain/instance/Instance";
import { mapPackageToD2Version } from "../mappers/D2VersionPackageMapper";
import { metadataTransformationsToDhis2 } from "../mappers/PackageTransformations";

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
            const versionedPayloadPackage = mapPackageToD2Version(apiVersion, metadata, metadataTransformationsToDhis2);

            console.debug("Versioned metadata package", versionedPayloadPackage);

            const response = await this.getApi(targetInstance)
                .post("/metadata", params, versionedPayloadPackage).getData();

            return response as MetadataImportResponse;
        } catch (error) {
            return this.buildResponseError(error);
        }
    }

    private getApi(targetInstance?: Instance): D2Api {
        return targetInstance ? new D2ApiDefault({
            baseUrl: targetInstance.url,
            auth: { username: targetInstance.username, password: targetInstance.password }
        }) : this.currentD2Api;
    }

    private async getVersion(targetInstance?: Instance): Promise<number> {
        if (!targetInstance) {
            const systemInfo = await this.currentD2Api.system.info.getData();
            return +systemInfo.version.split(".")[1];
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

}

export default MetadataD2ApiRepository;