import { Future, FutureData } from "../../domain/common/entities/Future";
import { WmrRequisiteType } from "../../domain/entities/wmr/entities/WmrRequisite";
import { WmrRequisitesRepository } from "../../domain/entities/wmr/repositories/WmrRequisitesRepository";
import { Instance } from "../../domain/instance/entities/Instance";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { apiToFuture } from "../common/utils/api-futures";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";
import { getJsonToFuture } from "../common/utils/request-futures";
import { Id } from "../../domain/common/entities/Schemas";

const AUTOGENFORMS_NAMESPACE = "d2-autogen-forms";
const AUTOGENFORMS_MAL_WMR_KEY = "MAL_WMR_COUNTRY_SYNC";
export class WmrRequisitesD2Repository implements WmrRequisitesRepository {
    private api: D2Api;
    constructor(private localInstance: Instance, private targetInstance?: Instance) {
        this.api = getD2APiFromInstance(this.localInstance, this.targetInstance);
    }

    checkWmrRequisites(requisiteType: WmrRequisiteType): FutureData<boolean> {
        switch (requisiteType) {
            case "metadata":
                return this.countryDatasetExists();
            case "dataStore":
                return this.dataStoreSettingsExist();
            default:
                return Future.error(new Error(`Unknown requisiteType ${requisiteType}`));
        }
    }

    private countryDatasetExists(): FutureData<boolean> {
        // TODO: make this CODE dynamic based on the file to import?
        // TODO: check consistency with the file to import, and also check other metadata such as constants, options, etc.?
        const CODE = "MAL_WMR_COUNTRY_SYNC";
        return apiToFuture(
            this.api.models.dataSets.get({
                filter: { code: { eq: CODE } },
                fields: { id: true },
            })
        ).map(response => response.objects.length !== 0);
    }

    private dataStoreSettingsExist(): FutureData<boolean> {
        // TODO: check consistency with the file to import?
        const dataStoreClient = new StorageDataStoreClient(
            this.localInstance,
            this.targetInstance,
            AUTOGENFORMS_NAMESPACE
        );
        return dataStoreClient.getObjectFuture(AUTOGENFORMS_MAL_WMR_KEY).map(malWmrSettings => !!malWmrSettings);
    }

    setupRequisite(requisiteType: WmrRequisiteType): FutureData<void> {
        switch (requisiteType) {
            case "metadata":
                return this.setupMetadataPackage();
            case "dataStore":
                return this.setupAutogenFormsDataStoreValue();
            default:
                return Future.error(new Error(`Unknown requisiteType ${requisiteType}`));
        }
    }

    private setupMetadataPackage(): FutureData<void> {
        return Future.joinObj({
            metadataPackageData: this.fetchMetadataPackage(),
            rootOrganisationUnitId: this.getRootOrganisationUnitId(),
        }).flatMap(({ metadataPackageData, rootOrganisationUnitId }) => {
            if (!this.isValidMetadataPackage(metadataPackageData)) {
                return Future.error(new Error("Invalid metadata package data"));
            }
            metadataPackageData.dataSets.forEach(dataSet => {
                dataSet.organisationUnits = [{ id: rootOrganisationUnitId }];
            });
            return apiToFuture(
                this.api.metadata.post(metadataPackageData, {
                    importStrategy: "CREATE_AND_UPDATE",
                    importMode: "COMMIT",
                    atomicMode: "ALL",
                    mergeMode: "REPLACE",
                })
            ).flatMap(importResponse => {
                if (importResponse.status !== "OK") {
                    console.error("Failed to import metadata package:", importResponse);
                    return Future.error(new Error(`Failed to import the metadata package`));
                }
                return Future.success(undefined);
            });
        });
    }

    private setupAutogenFormsDataStoreValue(): FutureData<void> {
        return this.fetchAutogenFormsDataStoreValue().flatMap(autogenFormsDataStoreData => {
            const dataStoreClient = new StorageDataStoreClient(
                this.localInstance,
                this.targetInstance,
                AUTOGENFORMS_NAMESPACE
            );
            return dataStoreClient.saveObjectFuture(AUTOGENFORMS_MAL_WMR_KEY, autogenFormsDataStoreData);
        });
    }

    private fetchMetadataPackage(): FutureData<object> {
        const WMR_METADATA_URL = "wmr/metadata.json";
        return getJsonToFuture(WMR_METADATA_URL);
    }

    private fetchAutogenFormsDataStoreValue(): FutureData<object> {
        const WMR_AUTOGEN_DATASTORE_URL = "wmr/dataStore.json";
        return getJsonToFuture(WMR_AUTOGEN_DATASTORE_URL);
    }

    private getRootOrganisationUnitId(): FutureData<Id> {
        return apiToFuture(
            this.api.models.organisationUnits.get({
                paging: false,
                filter: { level: { eq: "1" } },
                fields: { id: true },
            })
        ).map(response => {
            if (response.objects.length === 0) {
                throw new Error("No root organisation unit found");
            }
            return response.objects[0].id;
        });
    }

    private isValidMetadataPackage(data: unknown): data is { dataSets: any[] } {
        return !!data && typeof data === "object" && Array.isArray((data as any)?.dataSets);
    }

    validateOrgUnit(orgUnitId: string): FutureData<boolean> {
        return apiToFuture(
            this.api.models.organisationUnits.get({
                filter: { id: { eq: orgUnitId } },
                fields: { id: true },
            })
        ).map(response => response.objects.length > 0);
    }
}
