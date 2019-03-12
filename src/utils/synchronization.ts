import _ from "lodash";
import axios from "axios";

import Instance from "../models/instance";
import { D2 } from "../types/d2";
import { NestedRules, SynchronizationResult } from "../types/synchronization";

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
