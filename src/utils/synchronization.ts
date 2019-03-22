import axios from "axios";
import _ from "lodash";
import "../utils/lodash-mixins";

import Instance from "../models/instance";
import { D2 } from "../types/d2";
import { NestedRules, SynchronizationResult } from "../types/synchronization";
import { cleanModelName, isD2Model } from "./d2";
import { isValidUid } from "d2/uid";

export function buildNestedRules(rules: string[]): NestedRules {
    return _.transform(
        rules,
        (result, value) => {
            const [parentType, childType] = value.split(".");
            result[parentType] = result[parentType] || [];
            if (childType && !result[parentType].includes(childType)) {
                result[parentType].push(childType);
            }
        },
        {}
    );
}

export async function getMetadata(d2: D2, elements: string[]): Promise<SynchronizationResult> {
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
    return await axios.post(instance.url + "/metadata", metadata, {
        auth: {
            username: instance.username,
            password: instance.password,
        },
        params: {
            importMode: "VALIDATE",
            identifier: "AUTO",
            importReportMode: "FULL",
            importStrategy: "CREATE_AND_UPDATE",
            mergeMode: "REPLACE",
            atomicMode: "NONE",
        },
    });
}

export function getAllReferences(
    d2: D2,
    obj: any,
    type: string,
    parents: string[] = []
): SynchronizationResult {
    let result: SynchronizationResult = {};
    _.forEach(obj, (value, key) => {
        if (_.isObject(value) || _.isArray(value)) {
            const recursive = getAllReferences(d2, value, type, [...parents, key]);
            result = _.deepMerge(result, recursive);
        } else if (isValidUid(value)) {
            const metadataType = _(parents)
                .map(k => cleanModelName(k, type))
                .filter(k => isD2Model(d2, k))
                .first();
            if (metadataType) {
                result[metadataType] = result[metadataType] || [];
                result[metadataType].push(value);
            }
        }
    });
    return result;
}
