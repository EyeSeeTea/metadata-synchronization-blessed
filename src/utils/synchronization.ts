import i18n from "@dhis2/d2-i18n";
import { AxiosError } from "axios";
import { D2Api, D2CategoryOptionCombo } from "d2-api";
import { isValidUid } from "d2/uid";
import FileSaver from "file-saver";
import _ from "lodash";
import moment, { Moment } from "moment";
import memoize from "nano-memoize";
import { SyncronizationClass } from "../logic/sync/generic";
import Instance, { MetadataMapping, MetadataMappingDictionary } from "../models/instance";
import SyncRule from "../models/syncRule";
import {
    D2,
    DataImportParams,
    DataImportResponse,
    MetadataImportParams,
    MetadataImportResponse,
} from "../types/d2";
import {
    AggregatedPackage,
    CategoryOptionAggregationBuilder,
    DataSyncAggregation,
    DataSynchronizationParams,
    DataValue,
    MetadataPackage,
    NestedRules,
    ProgramEvent,
    SynchronizationResult,
    SyncRuleType,
} from "../types/synchronization";
import "../utils/lodash-mixins";
import { promiseMap } from "./common";
import { cleanToAPIChildReferenceName, cleanToModelName, getClassName } from "./d2";

const blacklistedProperties = ["access"];
const userProperties = ["user", "userAccesses", "userGroupAccesses"];

export function buildNestedRules(rules: string[][] = []): NestedRules {
    return _(rules)
        .filter(path => path.length > 1)
        .groupBy(_.first)
        .mapValues(path => path.map(_.tail))
        .value();
}

export function cleanObject(
    d2: D2,
    modelName: string,
    element: any,
    excludeRules: string[][] = [],
    includeSharingSettings: boolean
): any {
    const leafRules: string[] = _(excludeRules)
        .filter(path => path.length === 1)
        .map(_.first)
        .compact()
        .value();

    const cleanLeafRules = leafRules.reduce(
        (accumulator: string[], rule: string) => [
            ...accumulator,
            ...cleanToAPIChildReferenceName(d2, rule, modelName),
        ],
        []
    );

    const propsToRemove = includeSharingSettings ? [] : userProperties;

    return _.pick(
        element,
        _.difference(_.keys(element), cleanLeafRules, blacklistedProperties, propsToRemove)
    );
}

export function cleanReferences(
    references: MetadataPackage,
    includeRules: string[][] = []
): string[] {
    const rules = _(includeRules)
        .map(_.first)
        .compact()
        .value();

    return _.intersection(_.keys(references), rules);
}

export async function getMetadata(
    api: D2Api,
    elements: string[],
    fields = ":all"
): Promise<MetadataPackage> {
    const promises = [];
    for (let i = 0; i < elements.length; i += 100) {
        const requestElements = elements.slice(i, i + 100).toString();
        promises.push(
            api
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

export async function postMetadata(
    api: D2Api,
    metadata: any,
    additionalParams?: MetadataImportParams
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
        const response = await api.post("/metadata", params, metadata).getData();
        return response as MetadataImportResponse;
    } catch (error) {
        return buildResponseError(error);
    }
}

function buildResponseError(error: AxiosError): MetadataImportResponse {
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

export function getAllReferences(
    d2: D2,
    obj: any,
    type: string,
    parents: string[] = []
): MetadataPackage {
    let result: MetadataPackage = {};
    _.forEach(obj, (value, key) => {
        if (_.isObject(value) || _.isArray(value)) {
            const recursive = getAllReferences(d2, value, type, [...parents, key]);
            result = _.deepMerge(result, recursive);
        } else if (isValidUid(value)) {
            const metadataType = _(parents)
                .map(k => cleanToModelName(d2, k, type))
                .compact()
                .first();
            if (metadataType) {
                result[metadataType] = result[metadataType] || [];
                result[metadataType].push(value);
            }
        }
    });
    return result;
}

export function cleanMetadataImportResponse(
    importResult: MetadataImportResponse,
    instance: Instance,
    type: SyncRuleType
): SynchronizationResult {
    const { status: importStatus, stats, message, typeReports = [] } = importResult;
    const status = importStatus === "OK" ? "SUCCESS" : importStatus;
    const typeStats: any[] = [];
    const messages: any[] = [];

    typeReports.forEach(report => {
        const { klass, stats, objectReports = [] } = report;

        typeStats.push({
            ...stats,
            type: getClassName(klass),
        });

        objectReports.forEach((detail: any) => {
            const { uid, errorReports = [] } = detail;

            messages.push(
                ..._.take(errorReports, 1).map((error: any) => ({
                    uid,
                    type: getClassName(error.mainKlass),
                    property: error.errorProperty,
                    message: error.message,
                }))
            );
        });
    });

    return {
        status,
        stats,
        message,
        instance: instance.toObject(),
        report: { typeStats, messages },
        date: new Date(),
        type,
    };
}

export function cleanDataImportResponse(
    importResult: DataImportResponse,
    instance: Instance,
    type: SyncRuleType
): SynchronizationResult {
    const { status: importStatus, message, importCount, response, conflicts } = importResult;
    const status = importStatus === "OK" ? "SUCCESS" : importStatus;
    const eventsStats = _.pick(response, ["imported", "deleted", "ignored", "updated", "total"]);
    const aggregatedMessages = conflicts?.map(({ object, value }) => ({
        uid: object,
        message: value,
    }));
    const eventsMessages = _.flatten(
        response?.importSummaries?.map(
            ({ reference, description, conflicts }) =>
                conflicts?.map(({ object, value }) => ({
                    uid: reference,
                    message: _([description, object, value])
                        .compact()
                        .join(" "),
                })) ?? { uid: reference, message: description }
        )
    );

    return {
        status,
        message,
        stats: importCount || eventsStats,
        instance: instance.toObject(),
        report: { messages: aggregatedMessages ?? eventsMessages ?? [] },
        date: new Date(),
        type,
    };
}

export const availablePeriods: {
    [id: string]: {
        name: string;
        start?: [number, string];
        end?: [number, string];
    };
} = {
    ALL: { name: i18n.t("All periods") },
    FIXED: { name: i18n.t("Fixed period") },
    TODAY: { name: i18n.t("Today"), start: [0, "day"] },
    YESTERDAY: { name: i18n.t("Yesterday"), start: [1, "day"] },
    LAST_7_DAYS: { name: i18n.t("Last 7 days"), start: [7, "day"], end: [0, "day"] },
    LAST_14_DAYS: { name: i18n.t("Last 14 days"), start: [14, "day"], end: [0, "day"] },
    THIS_WEEK: { name: i18n.t("This week"), start: [0, "isoWeek"] },
    LAST_WEEK: { name: i18n.t("Last week"), start: [1, "isoWeek"] },
    THIS_MONTH: { name: i18n.t("This month"), start: [0, "month"] },
    LAST_MONTH: { name: i18n.t("Last month"), start: [1, "month"] },
    THIS_QUARTER: { name: i18n.t("This quarter"), start: [0, "quarter"] },
    LAST_QUARTER: { name: i18n.t("Last quarter"), start: [1, "quarter"] },
    THIS_YEAR: { name: i18n.t("This year"), start: [0, "year"] },
    LAST_YEAR: { name: i18n.t("Last year"), start: [1, "year"] },
    LAST_FIVE_YEARS: { name: i18n.t("Last 5 years"), start: [5, "year"], end: [1, "year"] },
};

function buildPeriodFromParams(params: DataSynchronizationParams): [Moment, Moment] {
    const {
        period,
        startDate = "1970-01-01",
        endDate = moment()
            .add(1, "years")
            .endOf("year")
            .format("YYYY-MM-DD"),
    } = params;

    if (!period || period === "ALL" || period === "FIXED") {
        return [moment(startDate), moment(endDate)];
    } else {
        const { start, end = start } = availablePeriods[period];
        if (start === undefined || end === undefined)
            throw new Error("Unsupported period provided");

        const [startAmount, startType] = start;
        const [endAmount, endType] = end;

        return [
            moment()
                .subtract(startAmount, startType as moment.unitOfTime.DurationConstructor)
                .startOf(startType as moment.unitOfTime.DurationConstructor),
            moment()
                .subtract(endAmount, endType as moment.unitOfTime.DurationConstructor)
                .endOf(endType as moment.unitOfTime.DurationConstructor),
        ];
    }
}

const aggregations = {
    DAILY: { format: "YYYYMMDD", unit: "days" as const, amount: 1 },
    WEEKLY: { format: "YYYY[W]W", unit: "weeks" as const, amount: 1 },
    MONTHLY: { format: "YYYYMM", unit: "months" as const, amount: 1 },
    QUARTERLY: { format: "YYYY[Q]Q", unit: "quarters" as const, amount: 1 },
    YEARLY: { format: "YYYY", unit: "years" as const, amount: 1 },
};

const buildPeriodsForAggregation = (
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

export async function getAggregatedData(
    api: D2Api,
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

    return api
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

export async function getAnalyticsData({
    api,
    dataParams,
    dimensionIds,
    filter,
    includeCategories,
}: {
    api: D2Api;
    dataParams: DataSynchronizationParams;
    dimensionIds: string[];
    filter?: string[];
    includeCategories: boolean;
}): Promise<AggregatedPackage> {
    const {
        orgUnitPaths = [],
        allAttributeCategoryOptions,
        attributeCategoryOptions,
        aggregationType,
    } = dataParams;
    const [startDate, endDate] = buildPeriodFromParams(dataParams);
    const periods = buildPeriodsForAggregation(aggregationType, startDate, endDate);
    const orgUnit = cleanOrgUnitPaths(orgUnitPaths);
    const attributeOptionCombo = !allAttributeCategoryOptions
        ? attributeCategoryOptions
        : undefined;

    if (dimensionIds.length === 0 || orgUnit.length === 0) {
        return { dataValues: [] };
    } else if (aggregationType) {
        const result = await promiseMap(_.chunk(periods, 500), period => {
            return api
                .get<AggregatedPackage>("/analytics/dataValueSet.json", {
                    dimension: _.compact([
                        `dx:${dimensionIds.join(";")}`,
                        `pe:${period.join(";")}`,
                        `ou:${orgUnit.join(";")}`,
                        includeCategories ? `co` : undefined,
                        attributeOptionCombo ? `ao:${attributeOptionCombo.join(";")}` : undefined,
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

export const getDefaultIds = memoize(
    async (api: D2Api, filter?: string) => {
        const response = (await api
            .get("/metadata", {
                filter: "code:eq:default",
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
    },
    { serializer: (api: D2Api) => api.baseUrl }
);

export const getCategoryOptionCombos = memoize(
    async (api: D2Api) => {
        const { objects } = await api.models.categoryOptionCombos
            .get({
                paging: false,
                fields: {
                    id: true,
                    name: true,
                    categoryCombo: true,
                    categoryOptions: true,
                },
            })
            .getData();

        return objects;
    },
    { serializer: (api: D2Api) => api.baseUrl }
);

export const getAllDimensions = memoize(
    async (api: D2Api) => {
        const { dimensions } = await api
            .get<{ dimensions: Array<{ id: string }> }>("/dimensions", {
                paging: false,
                fields: "id",
            })
            .getData();

        return dimensions.map(({ id }) => id);
    },
    { serializer: (api: D2Api) => api.baseUrl }
);

/**
 * Given all the aggregatedDataElements compile a list of dataElements
 * that have aggregation for their category options
 * @param MetadataMappingDictionary
 */
export const getAggregatedOptions = async (
    api: D2Api,
    { aggregatedDataElements }: MetadataMappingDictionary,
    categoryOptionCombos: Partial<D2CategoryOptionCombo>[]
): Promise<CategoryOptionAggregationBuilder[]> => {
    const dimensions = await getAllDimensions(api);
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
};

export const getRootOrgUnit = memoize(
    (api: D2Api) => {
        return api.models.organisationUnits.get({
            filter: { level: { eq: "1" } },
            fields: { $owner: true },
        });
    },
    { serializer: (api: D2Api) => api.baseUrl }
);

export function cleanObjectDefault(object: ProgramEvent, defaults: string[]): ProgramEvent;
export function cleanObjectDefault(object: DataValue, defaults: string[]): DataValue;
export function cleanObjectDefault(object: ProgramEvent | DataValue, defaults: string[]) {
    return _.pickBy(object, value => !defaults.includes(String(value)));
}

export function cleanOrgUnitPath(orgUnitPath?: string): string {
    return (
        _(orgUnitPath)
            .split("/")
            .last() ?? ""
    );
}

export function cleanOrgUnitPaths(orgUnitPaths: string[]): string[] {
    return orgUnitPaths.map(cleanOrgUnitPath);
}

export async function getEventsData(
    api: D2Api,
    params: DataSynchronizationParams,
    programs: string[] = []
) {
    const { period, orgUnitPaths = [], events = [], allEvents } = params;
    const [startDate, endDate] = buildPeriodFromParams(params);
    const defaults = await getDefaultIds(api);

    if (programs.length === 0) return [];

    const orgUnits = cleanOrgUnitPaths(orgUnitPaths);

    const result = [];

    for (const program of programs) {
        const { events: response } = (await api
            .get("/events", {
                paging: false,
                program,
                startDate: period !== "ALL" ? startDate.format("YYYY-MM-DD") : undefined,
                endDate: period !== "ALL" ? endDate.format("YYYY-MM-DD") : undefined,
            })
            .getData()) as { events: (ProgramEvent & { event: string })[] };

        result.push(...response);
    }

    return _(result)
        .filter(({ orgUnit }) => orgUnits.includes(orgUnit))
        .filter(({ event }) => (allEvents ? true : events.includes(event)))
        .map(object => ({ ...object, id: object.event }))
        .map(object => cleanObjectDefault(object, defaults))
        .value();
}

export async function postData(
    instance: Instance,
    endpoint: "/events" | "/dataValueSets",
    data: object,
    additionalParams: DataImportParams
): Promise<any> {
    try {
        const response = await instance
            .getApi()
            .post(
                endpoint,
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

        return response;
    } catch (error) {
        return buildResponseError(error);
    }
}

export async function postAggregatedData(
    instance: Instance,
    data: object,
    additionalParams?: DataImportParams
): Promise<any> {
    return postData(
        instance,
        "/dataValueSets",
        data,
        _.pick(additionalParams, ["strategy", "dryRun"])
    );
}

export async function postEventsData(
    instance: Instance,
    data: object,
    additionalParams?: DataImportParams
): Promise<any> {
    return postData(instance, "/events", data, _.pick(additionalParams, ["dryRun"]));
}

export function buildMetadataDictionary(metadataPackage: MetadataPackage) {
    return _(metadataPackage)
        .values()
        .flatten()
        .tap(array => {
            const dataSetElements = _.flatten(
                _.map(metadataPackage.dataSets ?? [], e =>
                    _.map(e.dataSetElements ?? [], ({ dataElement }) => dataElement)
                )
            );

            const groupDataElements = _.flatten(
                _.map(metadataPackage.dataElementGroups ?? [], e => e.dataElements ?? [])
            );

            const groupSetDataElements = _.flatten(
                _.map(metadataPackage.dataElementGroupSets ?? [], e =>
                    _.flatten(_.map(e.dataElementGroups ?? [], ({ dataElements }) => dataElements))
                )
            );

            array.push(...dataSetElements, ...groupDataElements, ...groupSetDataElements);
        })
        .keyBy("id")
        .value();
}

export async function requestJSONDownload(
    SyncClass: SyncronizationClass,
    syncRule: SyncRule,
    d2: D2,
    api: D2Api
) {
    const sync = new SyncClass(d2, api, syncRule.toBuilder());
    const payload = await sync.buildPayload();

    const json = JSON.stringify(payload, null, 4);
    const blob = new Blob([json], { type: "application/json" });
    const ruleName = _.kebabCase(_.toLower(syncRule.name));
    const date = moment().format("YYYYMMDDHHmm");
    const fileName = `${ruleName}-${syncRule.type}-sync-${date}.json`;
    FileSaver.saveAs(blob, fileName);
}

export const mapCategoryOptionCombo = (
    optionCombo: string | undefined,
    mappings: MetadataMappingDictionary[],
    originCategoryOptionCombos: Partial<D2CategoryOptionCombo>[],
    destinationCategoryOptionCombos: Partial<D2CategoryOptionCombo>[]
): string | undefined => {
    if (!optionCombo) return undefined;
    for (const mapping of mappings) {
        const { categoryOptions = {}, categoryCombos = {} } = mapping;
        const origin = _.find(originCategoryOptionCombos, ["id", optionCombo]);
        const isDisabled = _.some(
            origin?.categoryOptions?.map(({ id }) => categoryOptions[id]),
            { mappedId: "DISABLED" }
        );

        // Candidates built from equal category options
        const candidates = _.filter(destinationCategoryOptionCombos, o =>
            _.isEqual(
                _.sortBy(o.categoryOptions, ["id"]),
                _.sortBy(
                    origin?.categoryOptions?.map(({ id }) => ({
                        id: categoryOptions[id]?.mappedId,
                    })),
                    ["id"]
                )
            )
        );

        // Exact object built from equal category options and combo
        const exactObject = _.find(candidates, o =>
            _.isEqual(o.categoryCombo, {
                id:
                    categoryCombos[origin?.categoryCombo?.id ?? ""]?.mappedId ??
                    origin?.categoryCombo?.id,
            })
        );

        // If there's only one candidate, ignore the category combo, else provide exact object
        const candidate = candidates.length === 1 ? _.first(candidates) : exactObject;
        const defaultValue = isDisabled ? "DISABLED" : undefined;
        const result = candidate?.id ?? defaultValue;
        if (result) return result;
    }

    return optionCombo;
};

export const mapOptionValue = (
    value: string | undefined,
    mappings: MetadataMappingDictionary[]
): string => {
    for (const mapping of mappings) {
        const { options } = mapping;
        const candidate = _(options)
            .values()
            .find(["code", value]);

        if (candidate?.mappedCode) return candidate?.mappedCode;
    }

    return value ?? "";
};

export const mapProgramDataElement = (
    program: string,
    programStage: string,
    dataElement: string,
    mapping: MetadataMappingDictionary
): MetadataMapping => {
    const { programDataElements = {} } = mapping;
    const complexId = `${program}-${programStage}-${dataElement}`;
    const candidate = programDataElements[complexId]?.mappedId
        ? programDataElements[complexId]
        : programDataElements[dataElement];

    return candidate ?? {};
};
