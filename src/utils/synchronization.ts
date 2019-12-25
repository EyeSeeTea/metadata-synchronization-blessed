import axios, { AxiosBasicCredentials } from "axios";
import { D2Api } from "d2-api";
import { isValidUid } from "d2/uid";
import _ from "lodash";
import Instance from "../models/instance";
import {
    D2,
    MetadataImportParams,
    MetadataImportResponse,
    DataImportParams,
    DataImportResponse,
} from "../types/d2";
import {
    DataSynchronizationParams,
    MetadataPackage,
    NestedRules,
    SynchronizationResult,
    ProgramEvent,
} from "../types/synchronization";
import "../utils/lodash-mixins";
import { cleanModelName, getClassName } from "./d2";
import moment from "moment";
import memoize from "nano-memoize";

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
    fields: string = ":all",
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
            importMode: "COMMIT",
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
        if (error.response) {
            return error.response;
        } else {
            console.error(error);
            return { status: "NETWORK ERROR" };
        }
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
    const { status, stats, typeReports = [] } = importResult;
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
        instance: instance.toObject(),
        report: { typeStats, messages },
        date: new Date(),
    };
}

export function cleanDataImportResponse(
    importResult: DataImportResponse,
    instance: Instance
): SynchronizationResult {
    const { status, importCount, response, conflicts = [] } = importResult;
    const messages = conflicts.map(({ object, value }) => ({ uid: object, message: value }));
    const eventsStats = _.pick(response, ["imported", "deleted", "ignored", "updated", "total"]);

    return {
        status,
        stats: importCount || eventsStats,
        instance: instance.toObject(),
        report: { messages },
        date: new Date(),
    };
}

export async function getAggregatedData(
    api: D2Api,
    params: DataSynchronizationParams,
    dataSet: string[] = [],
    dataElementGroup: string[] = []
) {
    const { startDate, endDate, orgUnitPaths = [] } = params;

    if (dataSet.length === 0 && dataElementGroup.length === 0) return {};

    const orgUnit = _.compact(orgUnitPaths.map(path => _.last(path.split("/"))));

    return api
        .get("/dataValueSets", {
            dataElementIdScheme: "UID",
            orgUnitIdScheme: "UID",
            categoryOptionComboIdScheme: "UID",
            includeDeleted: false,
            startDate: moment(startDate).format("YYYY-MM-DD"),
            endDate: moment(endDate).format("YYYY-MM-DD"),
            dataSet,
            dataElementGroup,
            orgUnit,
        })
        .getData();
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

export function cleanObjectDefault(object: ProgramEvent, defaults: string[]) {
    return _.pickBy(object, value => !defaults.includes(value)) as ProgramEvent;
}

export async function getEventsData(
    api: D2Api,
    params: DataSynchronizationParams,
    programs: string[] = []
) {
    const { startDate, endDate, orgUnitPaths = [], events = [], allEvents } = params;
    const defaults = await getDefaultIds(api);

    if (programs.length === 0) return [];

    const orgUnits = _.compact(orgUnitPaths.map(path => _.last(path.split("/"))));

    const result = [];

    for (const program of programs) {
        const { events: response } = (await api
            .get("/events", {
                paging: false,
                program,
                startDate: startDate ? moment(startDate).format("YYYY-MM-DD") : undefined,
                endDate: endDate ? moment(endDate).format("YYYY-MM-DD") : undefined,
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
    additionalParams?: DataImportParams
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
        if (error.response) {
            console.log("DEBUG", error);
            return error.response;
        } else {
            console.error(error);
            return { status: "NETWORK ERROR" };
        }
    }
}

export async function postAggregatedData(
    instance: Instance,
    data: object,
    additionalParams?: DataImportParams
): Promise<any> {
    return postData(instance, "/dataValueSets", data, _.pick(additionalParams, ["strategy"]));
}

export async function postEventsData(
    instance: Instance,
    data: object,
    additionalParams?: DataImportParams
): Promise<any> {
    return postData(instance, "/events", data, _.pick(additionalParams, []));
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
