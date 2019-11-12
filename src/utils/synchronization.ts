import axios, { AxiosBasicCredentials } from "axios";
import _ from "lodash";
import "../utils/lodash-mixins";

import Instance from "../models/instance";
import { D2, MetadataImportParams, MetadataImportResponse } from "../types/d2";
import { MetadataPackage, NestedRules, SynchronizationResult } from "../types/synchronization";
import { cleanModelName, getClassName } from "./d2";
import { isValidUid } from "d2/uid";

const blacklistedProperties = ["user", "userAccesses", "userGroupAccesses"];

export function buildNestedRules(rules: string[][] = []): NestedRules {
    return _(rules)
        .filter(path => path.length > 1)
        .groupBy(_.first)
        .mapValues(path => path.map(_.tail))
        .value();
}

export function cleanObject(element: any, excludeRules: string[][] = []): any {
    const leafRules = _(excludeRules)
        .filter(path => path.length === 1)
        .map(_.first)
        .compact()
        .value();

    return _.pick(element, _.difference(_.keys(element), leafRules, blacklistedProperties));
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
            identifier: "AUTO",
            importReportMode: "FULL",
            importStrategy: "CREATE_AND_UPDATE",
            mergeMode: "REPLACE",
            atomicMode: "NONE",
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
        if (error.response && error.response.data) {
            const {
                status,
                httpStatus = "Unknown",
                httpStatusCode = 400,
                message = "Request failed unexpectedly",
            } = error.response.data;
            return { status, message: `Error ${httpStatusCode} (${httpStatus}): ${message}` };
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

export function cleanImportResponse(
    importResult: MetadataImportResponse,
    instance: Instance
): SynchronizationResult {
    const typeStats: any[] = [];
    const messages: any[] = [];

    if (importResult.typeReports) {
        importResult.typeReports.forEach(report => {
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
    }

    return {
        ..._.pick(importResult, ["status", "stats", "message"]),
        instance: _.pick(instance, ["id", "name", "url", "username"]),
        report: { typeStats, messages },
        date: new Date(),
    };
}
