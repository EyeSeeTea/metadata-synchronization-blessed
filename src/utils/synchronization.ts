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

    return _.pick(element, _.difference(_.keys(element), leafRules));
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

export function createMetadataExportUrl(d2: D2, elements: string[]): string {
    const requestUrl = d2.Api.getApi().baseUrl + "/metadata.json";
    return requestUrl + `?fields=:all&defaults=EXCLUDE&filter=id:in:[${elements.join(",")}]`;
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
    try {
        const params: MetadataImportParams = {
            importMode: "COMMIT",
            identifier: "AUTO",
            importReportMode: "FULL",
            importStrategy: "CREATE_AND_UPDATE",
            mergeMode: "REPLACE",
            atomicMode: "ALL",
        };

        // Note to self, we return await a promise to preserve the try/catch scope
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
        } else {
            console.error(error);
            return { data: { status: "NETWORK ERROR" } };
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
