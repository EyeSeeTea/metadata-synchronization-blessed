import { AxiosError } from "axios";
import _ from "lodash";
import { Moment } from "moment";
import { AggregatedPackage } from "../../../domain/aggregated/entities/AggregatedPackage";
import { AggregatedRepository } from "../../../domain/aggregated/repositories/AggregatedRepository";
import { DataSyncAggregation, DataSynchronizationParams } from "../../../domain/aggregated/types";
import { buildPeriodFromParams } from "../../../domain/aggregated/utils";
import { cleanOrgUnitPaths } from "../../../domain/synchronization/utils";
import Instance, { MetadataMappingDictionary } from "../../../models/instance";
import { DataImportParams, MetadataImportResponse, DataImportResponse } from "../../../types/d2";
import { D2Api, D2CategoryOptionCombo } from "../../../types/d2-api";
import { CategoryOptionAggregationBuilder, SyncRuleType } from "../../../types/synchronization";
import { promiseMap } from "../../../utils/common";
import {
    SynchronizationResult,
    SynchronizationStats,
} from "../../../domain/synchronization/entities/SynchronizationResult";

export class AggregatedD2ApiRepository implements AggregatedRepository {
    private currentD2Api: D2Api;

    constructor(d2Api: D2Api) {
        this.currentD2Api = d2Api;
    }

    public async getAggregated(
        params: DataSynchronizationParams,
        dataSet: string[],
        dataElementGroup: string[]
    ): Promise<AggregatedPackage> {
        const { orgUnitPaths = [], allAttributeCategoryOptions, attributeCategoryOptions } = params;
        const [startDate, endDate] = buildPeriodFromParams(params);

        if (dataSet.length === 0 && dataElementGroup.length === 0) return { dataValues: [] };

        const orgUnit = cleanOrgUnitPaths(orgUnitPaths);
        const attributeOptionCombo = !allAttributeCategoryOptions
            ? attributeCategoryOptions
            : undefined;

        return this.currentD2Api
            .get<AggregatedPackage>("/dataValueSets", {
                dataElementIdScheme: "UID",
                orgUnitIdScheme: "UID",
                categoryOptionComboIdScheme: "UID",
                includeDeleted: false,
                startDate: startDate.format("YYYY-MM-DD"),
                endDate: endDate.format("YYYY-MM-DD"),
                attributeOptionCombo,
                dataSet,
                dataElementGroup,
                orgUnit,
            })
            .getData();
    }

    public async getAnalytics({
        dataParams,
        dimensionIds,
        filter,
        includeCategories,
    }: {
        dataParams: DataSynchronizationParams;
        dimensionIds: string[];
        filter?: string[] | undefined;
        includeCategories: boolean;
    }): Promise<AggregatedPackage> {
        const {
            orgUnitPaths = [],
            allAttributeCategoryOptions,
            attributeCategoryOptions,
            aggregationType,
        } = dataParams;
        const [startDate, endDate] = buildPeriodFromParams(dataParams);
        const periods = this.buildPeriodsForAggregation(aggregationType, startDate, endDate);
        const orgUnit = cleanOrgUnitPaths(orgUnitPaths);
        const attributeOptionCombo = !allAttributeCategoryOptions
            ? attributeCategoryOptions
            : undefined;

        if (dimensionIds.length === 0 || orgUnit.length === 0) {
            return { dataValues: [] };
        } else if (aggregationType) {
            const result = await promiseMap(_.chunk(periods, 500), period => {
                return this.currentD2Api
                    .get<AggregatedPackage>("/analytics/dataValueSet.json", {
                        dimension: _.compact([
                            `dx:${dimensionIds.join(";")}`,
                            `pe:${period.join(";")}`,
                            `ou:${orgUnit.join(";")}`,
                            includeCategories ? `co` : undefined,
                            attributeOptionCombo
                                ? `ao:${attributeOptionCombo.join(";")}`
                                : undefined,
                        ]),
                        filter,
                    })
                    .getData();
            });

            const dataValues = _(result)
                .map(({ dataValues }) => dataValues)
                .flatten()
                .compact()
                .value();

            return { dataValues };
        } else {
            throw new Error("Aggregated syncronization requires a valid aggregation type");
        }
    }

    /**
     * Given all the aggregatedDataElements compile a list of dataElements
     * that have aggregation for their category options
     * @param MetadataMappingDictionary
     */
    public async getOptions(
        { aggregatedDataElements }: MetadataMappingDictionary,
        categoryOptionCombos: Partial<D2CategoryOptionCombo>[]
    ): Promise<CategoryOptionAggregationBuilder[]> {
        const dimensions = await this.getDimensions();
        const findOptionCombo = (mappedOption: string, mappedCombo?: string) =>
            categoryOptionCombos.find(
                ({ categoryCombo, categoryOptions }) =>
                    categoryCombo?.id === mappedCombo &&
                    categoryOptions?.map(({ id }) => id).includes(mappedOption)
            )?.id ?? mappedOption;

        const validOptions = _.transform(
            aggregatedDataElements,
            (result, { mapping = {} }, dataElement) => {
                const { categoryOptions, categoryCombos } = mapping;

                const builders = _(categoryOptions)
                    .mapValues(({ mappedId = "DISABLED" }, categoryOption) => ({
                        categoryOption,
                        mappedId,
                    }))
                    .values()
                    .groupBy(({ mappedId }) => mappedId)
                    .pickBy((values, mappedId) => values.length > 1 && mappedId !== "DISABLED")
                    .mapValues((values = [], mappedCategoryOption) => ({
                        dataElement,
                        categoryOptions: values.map(({ categoryOption }) => categoryOption),
                        mappedOptionCombo: findOptionCombo(
                            mappedCategoryOption,
                            _.values(categoryCombos)[0]?.mappedId
                        ),
                    }))
                    .values()
                    .value();
                result.push(...builders);
            },
            [] as Omit<CategoryOptionAggregationBuilder, "category">[]
        );

        const result = _.flatten(
            dimensions.map(category => validOptions.map(item => ({ ...item, category })))
        );

        return result;
    }

    public async getDimensions(): Promise<string[]> {
        const { dimensions } = await this.currentD2Api
            .get<{ dimensions: Array<{ id: string }> }>("/dimensions", {
                paging: false,
                fields: "id",
            })
            .getData();

        return dimensions.map(({ id }) => id);
    }

    public async save(
        data: object,
        additionalParams: DataImportParams | undefined,
        targetInstance: Instance
    ): Promise<SynchronizationResult> {
        try {
            const response = await this.currentD2Api
                .post<DataImportResponse>(
                    "/dataValueSets",
                    {
                        idScheme: "UID",
                        dataElementIdScheme: "UID",
                        orgUnitIdScheme: "UID",
                        eventIdScheme: "UID",
                        preheatCache: false,
                        skipExistingCheck: false,
                        format: "json",
                        async: false,
                        dryRun: false,
                        ...additionalParams,
                    },
                    data
                )
                .getData();

            return this.cleanDataImportResponse(response, targetInstance, "aggregated");
        } catch (error) {
            return this.cleanDataImportResponse(
                this.buildResponseError(error),
                targetInstance,
                "aggregated"
            );
        }
    }

    private buildPeriodsForAggregation = (
        aggregationType: DataSyncAggregation | undefined,
        startDate: Moment,
        endDate: Moment
    ): string[] => {
        if (!aggregationType) return [];
        const { format, unit, amount } = aggregations[aggregationType];

        const current = startDate.clone();
        const periods = [];

        while (current.isSameOrBefore(endDate)) {
            periods.push(current.format(format));
            current.add(amount, unit);
        }

        return periods;
    };

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

    private cleanDataImportResponse(
        importResult: DataImportResponse,
        instance: Instance,
        type: SyncRuleType
    ): SynchronizationResult {
        const { status: importStatus, message, importCount, response, conflicts } = importResult;
        const status = importStatus === "OK" ? "SUCCESS" : importStatus;
        const aggregatedMessages = conflicts?.map(({ object, value }) => ({
            id: object,
            message: value,
        }));

        const eventsMessages = _.flatten(
            response?.importSummaries?.map(
                ({ reference = "", description = "", conflicts }) =>
                    conflicts?.map(({ object, value }) => ({
                        id: reference,
                        message: _([description, object, value])
                            .compact()
                            .join(" "),
                    })) ?? { id: reference, message: description }
            )
        );

        const stats: SynchronizationStats = {
            created: importCount?.imported ?? response?.imported ?? 0,
            deleted: importCount?.deleted ?? response?.deleted ?? 0,
            updated: importCount?.updated ?? response?.updated ?? 0,
            ignored: importCount?.ignored ?? response?.ignored ?? 0,
            total: 0,
        };

        return {
            status,
            message,
            stats,
            instance: instance.toObject(),
            errors: aggregatedMessages ?? eventsMessages ?? [],
            date: new Date(),
            type,
        };
    }
}

const aggregations = {
    DAILY: { format: "YYYYMMDD", unit: "days" as const, amount: 1 },
    WEEKLY: { format: "YYYY[W]W", unit: "weeks" as const, amount: 1 },
    MONTHLY: { format: "YYYYMM", unit: "months" as const, amount: 1 },
    QUARTERLY: { format: "YYYY[Q]Q", unit: "quarters" as const, amount: 1 },
    YEARLY: { format: "YYYY", unit: "years" as const, amount: 1 },
};
