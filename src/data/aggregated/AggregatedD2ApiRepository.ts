import _ from "lodash";
import { Moment } from "moment";
import { AggregatedPackage } from "../../domain/aggregated/entities/AggregatedPackage";
import { MappedCategoryOption } from "../../domain/aggregated/entities/MappedCategoryOption";
import { AggregatedRepository } from "../../domain/aggregated/repositories/AggregatedRepository";
import { DataSyncAggregation, DataSynchronizationParams } from "../../domain/aggregated/types";
import { buildPeriodFromParams } from "../../domain/aggregated/utils";
import { Instance } from "../../domain/instance/entities/Instance";
import { MetadataMappingDictionary } from "../../domain/mapping/entities/MetadataMapping";
import { CategoryOptionCombo } from "../../domain/metadata/entities/MetadataEntities";
import { SynchronizationResult } from "../../domain/synchronization/entities/SynchronizationResult";
import { cleanOrgUnitPaths } from "../../domain/synchronization/utils";
import { DataImportParams } from "../../types/d2";
import { D2Api, DataValueSetsPostResponse } from "../../types/d2-api";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance } from "../../utils/d2-utils";

export class AggregatedD2ApiRepository implements AggregatedRepository {
    private api: D2Api;

    constructor(private instance: Instance) {
        this.api = getD2APiFromInstance(instance);
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

        try {
            const response = await this.api
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

            return response;
        } catch (error) {
            console.error(error);
            return { dataValues: [] };
        }
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
                return this.api
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
        categoryOptionCombos: Partial<CategoryOptionCombo>[]
    ): Promise<MappedCategoryOption[]> {
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
            [] as Omit<MappedCategoryOption, "category">[]
        );

        const result = _.flatten(
            dimensions.map(category => validOptions.map(item => ({ ...item, category })))
        );

        return result;
    }

    public async getDimensions(): Promise<string[]> {
        const { dimensions } = await this.api
            .get<{ dimensions: Array<{ id: string }> }>("/dimensions", {
                paging: false,
                fields: "id",
            })
            .getData();

        return dimensions.map(({ id }) => id);
    }

    public async save(
        data: object,
        additionalParams: DataImportParams | undefined
    ): Promise<SynchronizationResult> {
        try {
            const response = await this.api
                .post<DataValueSetsPostResponse>(
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

            return this.cleanAggregatedImportResponse(response);
        } catch (error) {
            if (error?.response?.data) {
                return this.cleanAggregatedImportResponse(error.response.data);
            }

            return {
                status: "NETWORK ERROR",
                instance: this.instance.toPublicObject(),
                date: new Date(),
                type: "aggregated",
            };
        }
    }

    private cleanAggregatedImportResponse(
        importResult: DataValueSetsPostResponse
    ): SynchronizationResult {
        const { status, description, importCount, conflicts } = importResult;

        const errors =
            conflicts?.map(({ object, value }) => ({
                id: object,
                message: value,
            })) ?? [];

        return {
            status,
            message: description,
            stats: importCount,
            instance: this.instance.toPublicObject(),
            errors,
            date: new Date(),
            type: "aggregated",
        };
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
}

const aggregations = {
    DAILY: { format: "YYYYMMDD", unit: "days" as const, amount: 1 },
    WEEKLY: { format: "YYYY[W]W", unit: "weeks" as const, amount: 1 },
    MONTHLY: { format: "YYYYMM", unit: "months" as const, amount: 1 },
    QUARTERLY: { format: "YYYY[Q]Q", unit: "quarters" as const, amount: 1 },
    YEARLY: { format: "YYYY", unit: "years" as const, amount: 1 },
};
