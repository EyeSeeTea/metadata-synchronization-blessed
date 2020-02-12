import i18n from "@dhis2/d2-i18n";
import axios, { AxiosBasicCredentials, AxiosError } from "axios";
import { D2Api } from "d2-api";
import { isValidUid } from "d2/uid";
import FileSaver from "file-saver";
import _ from "lodash";
import moment, { Moment } from "moment";
import memoize from "nano-memoize";
import { SyncronizationClass } from "../logic/sync/generic";
import Instance from "../models/instance";
import SyncRule from "../models/syncRule";
import {
    D2,
    DataImportParams,
    DataImportResponse,
    MetadataImportParams,
    MetadataImportResponse,
} from "../types/d2";
import {
    DataSynchronizationParams,
    MetadataPackage,
    NestedRules,
    ProgramEvent,
    SynchronizationResult,
    DataValue,
} from "../types/synchronization";
import "../utils/lodash-mixins";
import { cleanModelName, getClassName } from "./d2";

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
    element: any,
    excludeRules: string[][] = [],
    includeSharingSettings: boolean
): any {
    const leafRules = _(excludeRules)
        .filter(path => path.length === 1)
        .map(_.first)
        .compact()
        .value();

    const propsToRemove = includeSharingSettings ? [] : userProperties;

    return _.pick(
        element,
        _.difference(_.keys(element), leafRules, blacklistedProperties, propsToRemove)
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
    baseUrl: string,
    elements: string[],
    fields = ":all",
    auth: AxiosBasicCredentials | undefined = undefined
): Promise<MetadataPackage> {
    const promises = [];
    for (let i = 0; i < elements.length; i += 100) {
        const requestUrl = baseUrl + "/metadata.json";
        const requestElements = elements.slice(i, i + 100).toString();
        promises.push(
            axios.get(requestUrl, {
                auth,
                withCredentials: true,
                params: {
                    fields: fields,
                    filter: "id:in:[" + requestElements + "]",
                    defaults: "EXCLUDE",
                },
            })
        );
    }
    const response = await Promise.all(promises);
    const results = _.deepMerge({}, ...response.map(result => result.data));
    if (results.system) delete results.system;
    return results;
}

export async function postMetadata(
    instance: Instance,
    metadata: object,
    additionalParams?: MetadataImportParams
): Promise<MetadataImportResponse> {
    try {
        const params: MetadataImportParams = {
            importMode: additionalParams?.importMode ?? "COMMIT",
            identifier: "UID",
            importReportMode: "FULL",
            importStrategy: "CREATE_AND_UPDATE",
            mergeMode: "MERGE",
            atomicMode: "ALL",
            ...additionalParams,
        };
        const response = await axios.post(instance.url + "/api/metadata", metadata, {
            auth: {
                username: instance.username,
                password: instance.password,
            },
            params,
        });

        return response.data;
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
                .map(k => cleanModelName(d2, k, type))
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
    instance: Instance
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
    };
}

export function cleanDataImportResponse(
    importResult: DataImportResponse,
    instance: Instance
): SynchronizationResult {
    const { status: importStatus, message, importCount, response, conflicts } = importResult;
    const status = importStatus === "OK" ? "SUCCESS" : importStatus;
    const eventsStats = _.pick(response, ["imported", "deleted", "ignored", "updated", "total"]);
    const aggregatedMessages = conflicts?.map(({ object, value }) => ({
        uid: object,
        message: value,
    }));
    const eventsMessages = response?.importSummaries?.map(({ reference, description }) => ({
        uid: reference,
        message: description,
    }));

    return {
        status,
        message,
        stats: importCount || eventsStats,
        instance: instance.toObject(),
        report: { messages: aggregatedMessages ?? eventsMessages ?? [] },
        date: new Date(),
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
};

function buildPeriodFromParams(params: DataSynchronizationParams): [Moment, Moment] {
    const {
        period,
        startDate = "1970-01-01",
        endDate = moment()
            .add(10, "years")
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

export async function getAggregatedData(
    api: D2Api,
    params: DataSynchronizationParams,
    dataSet: string[] = [],
    dataElementGroup: string[] = []
) {
    const { orgUnitPaths = [], allAttributeCategoryOptions, attributeCategoryOptions } = params;
    const [startDate, endDate] = buildPeriodFromParams(params);

    if (dataSet.length === 0 && dataElementGroup.length === 0) return {};

    const orgUnit = cleanOrgUnitPaths(orgUnitPaths);
    const attributeOptionCombo = !allAttributeCategoryOptions
        ? attributeCategoryOptions
        : undefined;

    return api
        .get("/dataValueSets", {
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
        .getData() as Promise<{ dataValues?: DataValue[] }>;
}

export const getDefaultIds = memoize(
    async (api: D2Api) => {
        const response = (await api
            .get("/metadata", {
                filter: "code:eq:default",
                fields: "id",
            })
            .getData()) as {
                [key: string]: { id: string }[];
            };

        return _(response)
            .omit(["system"])
            .values()
            .flatten()
            .map(({ id }) => id)
            .value();
    },
    { maxArgs: 0 }
);

export const getRootOrgUnit = memoize(
    async (api: D2Api) =>
        api.models.organisationUnits
            .get({
                filter: { level: { eq: "1" } },
                fields: { $owner: true },
            })
            .getData(),
    { maxArgs: 0 }
);

export function cleanObjectDefault(object: ProgramEvent, defaults: string[]): ProgramEvent;
export function cleanObjectDefault(object: DataValue, defaults: string[]): DataValue;
export function cleanObjectDefault(object: ProgramEvent | DataValue, defaults: string[]) {
    return _.pickBy(object, value => !defaults.includes(String(value)));
}

export function cleanOrgUnitPath(orgUnitPath: string): string {
    return _.last(orgUnitPath.split("/")) ?? orgUnitPath;
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
                    dryRun: additionalParams?.dryRun ?? false,
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
