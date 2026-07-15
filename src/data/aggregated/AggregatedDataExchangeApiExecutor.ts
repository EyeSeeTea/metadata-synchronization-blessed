import { AggregatedDataExchangeExecutor } from "../../domain/aggregated/repositories/AggregatedDataExchangeExecutor";
import { Instance } from "../../domain/instance/entities/Instance";
import { SynchronizationResult } from "../../domain/reports/entities/SynchronizationResult";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-utils";

export class AggregatedDataExchangeApiExecutor implements AggregatedDataExchangeExecutor {
    private api: D2Api;

    constructor(localInstance: Instance) {
        this.api = getD2APiFromInstance(localInstance);
    }

    async execute(aggregatedDataExchangeId: string, targetInstance: Instance): Promise<SynchronizationResult> {
        try {
            const result = await this.api
                .post<AdexExecutioonResponse>(`aggregateDataExchanges/${aggregatedDataExchangeId}/exchange`)
                .getData();

            return this.buildSynchronizationResult(result, targetInstance);
        } catch (error: any) {
            if (error?.response?.data?.response) {
                return this.buildSynchronizationResult(error.response.data, targetInstance);
            }

            return {
                status: "NETWORK ERROR",
                message: error?.response?.data?.message || error.message,
                instance: targetInstance.toPublicObject(),
                date: new Date(),
                type: "aggregated",
            };
        }
    }

    private buildSynchronizationResult(
        importResult: AdexExecutioonResponse,
        targetInstance: Instance
    ): SynchronizationResult {
        const { status, description, importCount, conflicts } = importResult.response.importSummaries[0];

        const errors =
            conflicts?.map(({ object, value }) => ({
                id: object,
                message: value,
            })) ?? [];

        return {
            status,
            message: description,
            stats: importCount,
            instance: targetInstance.toPublicObject(),
            errors,
            date: new Date(),
            type: "aggregated",
            response: importResult,
        };
    }
}

type AdexExecutioonResponse = {
    response: {
        description: string;
        responseType: "ImportSummaries";
        status: "SUCCESS" | "ERROR" | "WARNING";
        imported: number;
        updated: number;
        ignored: number;
        deleted: number;
        importSummaries: AdexImportSummary[];
    };
};

type ImportStrategy =
    | "CREATE"
    | "UPDATE"
    | "CREATE_AND_UPDATE"
    | "DELETE"
    | "NEW_AND_UPDATES"
    | "NEW"
    | "UPDATES"
    | "DELETES";

type AdexImportSummary = {
    responseType: "ImportSummary";
    status: "SUCCESS" | "ERROR" | "WARNING";
    description: string;
    importOptions: {
        idSchemes: object;
        dryRun: boolean;
        async: boolean;
        importStrategy: ImportStrategy;
        mergeMode: string;
        reportMode: string;
        skipExistingCheck: boolean;
        sharing: boolean;
        skipNotifications: boolean;
        skipAudit: boolean;
        datasetAllowsPeriods: boolean;
        strictPeriods: boolean;
        strictDataElements: boolean;
        strictCategoryOptionCombos: boolean;
        strictAttributeOptionCombos: boolean;
        strictOrganisationUnits: boolean;
        requireCategoryOptionCombo: boolean;
        requireAttributeOptionCombo: boolean;
        skipPatternValidation: boolean;
        ignoreEmptyCollection: boolean;
        force: boolean;
        firstRowIsHeader: boolean;
        skipLastUpdated: boolean;
    };
    importCount: {
        imported: number;
        updated: number;
        ignored: number;
        deleted: number;
    };
    dataSetComplete: boolean;
    conflicts?: Array<{
        object: string;
        value: string;
    }>;
};
