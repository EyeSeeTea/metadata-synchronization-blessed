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
    const { status, importCount, conflicts = [] } = importResult;
    const messages = conflicts.map(({ object, value }) => ({ uid: object, message: value }));

    return {
        status,
        stats: importCount,
        instance: instance.toObject(),
        report: { messages },
        date: new Date(),
    };
}

export async function getData(
    api: D2Api,
    params: DataSynchronizationParams,
    dataSet: string[] = [],
    dataElementGroup: string[] = []
) {
    const {
        startDate,
        endDate,
        orgUnits: orgUnit = [],
        includeChildrenOrgUnits: children = false,
    } = params;

    if (dataSet.length === 0 && dataElementGroup.length === 0) return {};

    return api
        .get("/dataValueSets", {
            dataElementIdScheme: "UID",
            orgUnitIdScheme: "UID",
            categoryOptionComboIdScheme: "UID",
            includeDeleted: false,
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
            dataSet,
            dataElementGroup,
            orgUnit,
            children,
        })
        .getData();
}

export async function postData(
    instance: Instance,
    data: object,
    additionalParams?: DataImportParams
): Promise<any> {
    try {
        const response = await instance
            .getApi()
            .post(
                "/dataValueSets",
                {
                    idScheme: "UID",
                    dataElementIdScheme: "UID",
                    orgUnitIdScheme: "UID",
                    preheatCache: false,
                    skipExistingCheck: false,
                    strategy: "NEW_AND_UPDATES",
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
