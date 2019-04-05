import axios from "axios";
import _ from "lodash";
import "../utils/lodash-mixins";

import Instance from "../models/instance";
import { D2, MetadataImportParams } from "../types/d2";
import { NestedRules, MetadataPackage } from "../types/synchronization";
import { cleanModelName } from "./d2";
import { isValidUid } from "d2/uid";

export function buildNestedRules(rules: string[][] = []): NestedRules {
    return _(rules)
        .filter(path => path.length > 1)
        .groupBy(_.head)
        .tap(object => {
            _.forOwn(object, (array, key) => (object[key] = array.map(rule => rule.slice(1))));
        })
        .value();
}

export function cleanObject(element: any, excludeRules: string[][] = []): any {
    const leafRules = excludeRules.filter(array => array.length === 1).map(array => array[0]);
    return _.pick(element, _.difference(_.keys(element), leafRules));
}

export function cleanReferences(
    references: MetadataPackage,
    includeRules: string[][] = []
): string[] {
    return _.intersection(_.keys(references), includeRules.map(array => array[0]));
}

export async function getMetadata(d2: D2, elements: string[]): Promise<MetadataPackage> {
    const promises = [];
    for (let i = 0; i < elements.length; i += 100) {
        const requestUrl = d2.Api.getApi().baseUrl + "/metadata.json";
        const requestElements = elements.slice(i, i + 100).toString();
        promises.push(
            axios.get(requestUrl, {
                withCredentials: true,
                params: {
                    fields: ":all",
                    filter: "id:in:[" + requestElements + "]",
                    defaults: "EXCLUDE",
                },
            })
        );
    }
    const result = await Promise.all(promises);
    return _.deepMerge({}, ...result.map(result => result.data));
}

export async function postMetadata(instance: Instance, metadata: any): Promise<any> {
    const params: MetadataImportParams = {
        importMode: "COMMIT",
        identifier: "AUTO",
        importReportMode: "FULL",
        importStrategy: "CREATE_AND_UPDATE",
        mergeMode: "REPLACE",
        atomicMode: "ALL",
    };

    try {
        return await axios.post(instance.url + "/api/metadata", metadata, {
            auth: {
                username: instance.username,
                password: instance.password,
            },
            params,
        });
    } catch (error) {
        if (error.response) {
            return error.response;
        } else if (error.request) {
            return { data: { status: "NETWORK ERROR" }};
        } else {
            throw error;
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
