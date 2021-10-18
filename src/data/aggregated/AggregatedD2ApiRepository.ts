import _ from "lodash";
import moment, { Moment } from "moment";
import { AggregatedPackage } from "../../domain/aggregated/entities/AggregatedPackage";
import { DataSyncAggregation } from "../../domain/aggregated/entities/DataSyncAggregation";
import {
    DataImportParams,
    DataSynchronizationParams,
} from "../../domain/aggregated/entities/DataSynchronizationParams";
import { DataValue } from "../../domain/aggregated/entities/DataValue";
import { MappedCategoryOption } from "../../domain/aggregated/entities/MappedCategoryOption";
import { AggregatedRepository } from "../../domain/aggregated/repositories/AggregatedRepository";
import { buildPeriodFromParams } from "../../domain/aggregated/utils";
import { Instance } from "../../domain/instance/entities/Instance";
import { MetadataMappingDictionary } from "../../domain/mapping/entities/MetadataMapping";
import { CategoryOptionCombo } from "../../domain/metadata/entities/MetadataEntities";
import { SynchronizationResult } from "../../domain/reports/entities/SynchronizationResult";
import { cleanOrgUnitPaths } from "../../domain/synchronization/utils";
import { D2Api, DataValueSetsPostResponse } from "../../types/d2-api";
import { cache } from "../../utils/cache";
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
        const { orgUnitPaths = [], allAttributeCategoryOptions, attributeCategoryOptions, lastUpdated } = params;
        const { startDate, endDate } = buildPeriodFromParams(params);

        if (dataSet.length === 0 && dataElementGroup.length === 0) return { dataValues: [] };

        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);
        const attributeOptionCombo = !allAttributeCategoryOptions ? attributeCategoryOptions : undefined;

        const [defaultCategoryOptionCombo] = await this.getDefaultIds("categoryOptionCombos");

        const dimensions = _.uniqBy(
            [
                ...dataSet.map(id => ({ type: "dataSet", id })),
                ...dataElementGroup.map(id => ({ type: "dataElementGroup", id })),
            ],
            ({ id }) => id
        );

        try {
            // Chunked request by orgUnits and dimensions (dataSets and dataElementGroups) to avoid 414
            const dataValues = await promiseMap(_.chunk(orgUnits, 100), orgUnit =>
                promiseMap(_.chunk(dimensions, 50), dimensions => {
                    const dataSet = dimensions.filter(({ type }) => type === "dataSet").map(({ id }) => id);
                    const dataElementGroup = dimensions
                        .filter(({ type }) => type === "dataElementGroup")
                        .map(({ id }) => id);

                    return this.api.dataValues
                        .getSet({
                            dataElementIdScheme: "UID",
                            orgUnitIdScheme: "UID",
                            categoryOptionComboIdScheme: "UID",
                            includeDeleted: false,
                            startDate: startDate.format("YYYY-MM-DD"),
                            endDate: endDate.format("YYYY-MM-DD"),
                            attributeOptionCombo,
                            dataSet: [dataSet.join(",")],
                            dataElementGroup: [dataElementGroup.join(",")],
                            orgUnit: [orgUnit.join(",")],
                            lastUpdated: lastUpdated ? moment(lastUpdated).format("YYYY-MM-DD") : undefined,
                        })
                        .map(({ data }) =>
                            data.dataValues.map(
                                ({
                                    dataElement,
                                    period,
                                    orgUnit,
                                    categoryOptionCombo,
                                    attributeOptionCombo,
                                    value,
                                    comment,
                                }) => ({
                                    dataElement,
                                    period,
                                    orgUnit,
                                    value,
                                    comment,
                                    categoryOptionCombo: categoryOptionCombo ?? defaultCategoryOptionCombo,
                                    attributeOptionCombo: attributeOptionCombo ?? defaultCategoryOptionCombo,
                                })
                            )
                        )
                        .getData();
                })
            );

            return {
                dataValues: _(dataValues)
                    .flatten()
                    .flatten()
                    .uniqBy(({ orgUnit, period, dataElement, categoryOptionCombo }) =>
                        [orgUnit, period, dataElement, categoryOptionCombo].join("-")
                    )
                    .value(),
            };
        } catch (error: any) {
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
            includeAnalyticsZeroValues,
        } = dataParams;

        const { startDate, endDate } = buildPeriodFromParams(dataParams);
        const periods = this.buildPeriodsForAggregation(aggregationType, startDate, endDate);
        const orgUnits = cleanOrgUnitPaths(orgUnitPaths);
        const attributeOptionCombo = !allAttributeCategoryOptions ? attributeCategoryOptions : undefined;

        if (dimensionIds.length === 0 || orgUnits.length === 0) {
            return { dataValues: [] };
        } else if (aggregationType) {
            const result = await promiseMap(_.chunk(periods, 5), period =>
                promiseMap(_.chunk(dimensionIds, Math.max(10, 100 - period.length)), ids => {
                    return this.api
                        .get<AggregatedPackage>("/analytics/dataValueSet.json", {
                            dimension: _.compact([
                                `dx:${ids.join(";")}`,
                                `pe:${period.join(";")}`,
                                `ou:${orgUnits.join(";")}`,
                                includeCategories ? `co` : undefined,
                                attributeOptionCombo ? `ao:${attributeOptionCombo.join(";")}` : undefined,
                            ]),
                            filter,
                        })
                        .getData();
                })
            );

            const [defaultCategoryOptionCombo] = await this.getDefaultIds("categoryOptionCombos");

            const analyticsValues = _(result)
                .flatten()
                .map(({ dataValues = [] }: AggregatedPackage): DataValue[] =>
                    dataValues.map(
                        ({
                            dataElement,
                            period,
                            orgUnit,
                            categoryOptionCombo,
                            attributeOptionCombo,
                            value,
                            comment,
                        }) => ({
                            dataElement,
                            period,
                            orgUnit,
                            value,
                            comment,
                            // Special scenario: For indicators do not send attributeOptionCombo
                            attributeOptionCombo: includeCategories
                                ? attributeOptionCombo ?? defaultCategoryOptionCombo
                                : undefined,
                            // Special scenario: We allow having dataElement.categoryOptionCombo in indicators
                            categoryOptionCombo: includeCategories
                                ? categoryOptionCombo ?? defaultCategoryOptionCombo
                                : defaultCategoryOptionCombo,
                        })
                    )
                )
                .flatten()
                .compact()
                .value();

            const zeroValues: DataValue[] =
                includeAnalyticsZeroValues && !includeCategories
                    ? _.flatMap(dimensionIds, dataElement =>
                          _.flatMap(periods, period =>
                              _.flatMap(orgUnits, orgUnit => ({
                                  dataElement,
                                  period,
                                  orgUnit,
                                  categoryOptionCombo: defaultCategoryOptionCombo,
                                  value: "0",
                                  comment: "[aggregated]",
                              }))
                          )
                      )
                    : [];

            const extraValues = zeroValues.filter(
                ({ dataElement, period, orgUnit, categoryOptionCombo }) =>
                    !_.find(analyticsValues, {
                        dataElement,
                        period,
                        orgUnit,
                        categoryOptionCombo,
                    })
            );

            return { dataValues: [...analyticsValues, ...extraValues] };
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
                    categoryCombo?.id === mappedCombo && categoryOptions?.map(({ id }) => id).includes(mappedOption)
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
                    .mapValues((values, mappedCategoryOption) => ({
                        dataElement,
                        categoryOptions: values?.map(({ categoryOption }) => categoryOption) ?? [],
                        mappedOptionCombo: findOptionCombo(mappedCategoryOption, _.values(categoryCombos)[0]?.mappedId),
                    }))
                    .values()
                    .value();
                result.push(...builders);
            },
            [] as Omit<MappedCategoryOption, "category">[]
        );

        const result = _.flatten(dimensions.map(category => validOptions.map(item => ({ ...item, category }))));

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

    async delete(data: AggregatedPackage): Promise<SynchronizationResult> {
        // TODO: To be refactored. Requires authority F_SKIP_DATA_IMPORT_AUDIT.
        return await this.save(data, { strategy: "DELETES", skipAudit: true });
    }

    public async save(data: AggregatedPackage, params: DataImportParams = {}): Promise<SynchronizationResult> {
        try {
            const { response } = await this.api.dataValues
                .postSetAsync(
                    {
                        idScheme: params.idScheme ?? "UID",
                        dataElementIdScheme: params.dataElementIdScheme ?? "UID",
                        orgUnitIdScheme: params.orgUnitIdScheme ?? "UID",
                        preheatCache: params.preheatCache ?? false,
                        skipExistingCheck: params.skipExistingCheck ?? false,
                        skipAudit: params.skipAudit ?? false,
                        dryRun: params.dryRun ?? false,
                        importStrategy: params.strategy ?? "CREATE_AND_UPDATE",
                    },
                    data
                )
                .getData();

            const result = await this.api.system.waitFor(response.jobType, response.id).getData();

            if (!result) {
                return {
                    status: "ERROR",
                    instance: this.instance.toPublicObject(),
                    date: new Date(),
                    type: "aggregated",
                };
            }

            return this.cleanAggregatedImportResponse(result);
        } catch (error: any) {
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

    private cleanAggregatedImportResponse(importResult: DataValueSetsPostResponse): SynchronizationResult {
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

    @cache()
    public async getDefaultIds(filter?: string): Promise<string[]> {
        const response = (await this.api
            .get("/metadata", {
                filter: "identifiable:eq:default",
                fields: "id",
            })
            .getData()) as {
            [key: string]: { id: string }[];
        };

        const metadata = _.pickBy(response, (_value, type) => !filter || type === filter);

        return _(metadata)
            .omit(["system"])
            .values()
            .flatten()
            .map(({ id }) => id)
            .value();
    }
}

const aggregations = {
    DAILY: { format: "YYYYMMDD", unit: "days" as const, amount: 1 },
    WEEKLY: { format: "GGGG[W]W", unit: "weeks" as const, amount: 1 },
    MONTHLY: { format: "YYYYMM", unit: "months" as const, amount: 1 },
    QUARTERLY: { format: "YYYY[Q]Q", unit: "quarters" as const, amount: 1 },
    YEARLY: { format: "YYYY", unit: "years" as const, amount: 1 },
};
