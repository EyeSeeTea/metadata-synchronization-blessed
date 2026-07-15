import { D2Api } from "../../../types/d2-api";
import { RuleAggregatedDataExchange } from "../../../domain/rules/value-object/RuleAggregatedDataExchange";
import { InstanceDataStoreData } from "../../instance/InstanceD2ApiRepository";
import { getAggregatedDataExchanges } from "../../aggregated/getAggregateDataExchange";
import { AggregatedDataExchange } from "../../aggregated/models/AggregatedDataExchange";

export async function getRuleAggregatedDataExchanges(
    api: D2Api,
    adexRefs: { id: string }[],
    instances: InstanceDataStoreData[]
): Promise<RuleAggregatedDataExchange[]> {
    const adexIds = adexRefs.map(r => r.id);

    const adexItems: AggregatedDataExchange[] = await getAggregatedDataExchanges(api, adexIds);

    const foundIds = new Set(adexItems.map(item => item.id));
    const missingIds = adexIds.filter(id => !foundIds.has(id));
    if (missingIds.length > 0) {
        throw new Error(`Aggregated Data Exchange not found in DHIS2: ${missingIds.join(", ")}`);
    }

    return adexItems.map(adex => {
        if (adex.target.type === "INTERNAL") {
            const instance = instances.find(
                inst => inst.type === "aggregated-data-exchange" && inst.exchangeTargetType === "internal"
            );

            if (!instance) {
                throw new Error(
                    `Internal Aggregated Data Exchange instance not found for Aggregated Data Exchange ${adex.id}`
                );
            }

            return RuleAggregatedDataExchange.createExisted({
                id: adex.id,
                target: {
                    instanceId: instance.id,
                    type: "internal",
                    authType: "http-basic",
                },
            }).getOrThrow();
        }

        const instance = instances.find(
            inst => inst.url === adex.target.api?.url && inst.type === "aggregated-data-exchange"
        );

        if (!instance) {
            throw new Error(
                `Instance with url ${adex.target.api?.url} not found for Aggregated Data Exchange ${adex.id}`
            );
        }

        return RuleAggregatedDataExchange.createExisted({
            id: adex.id,
            target: {
                instanceId: instance.id,
                type: "external",
                authType: adex.target.api?.username ? "http-basic" : "api-token",
                username: adex.target.api?.username,
                password: adex.target.api?.password,
                token: adex.target.api?.token,
            },
        }).getOrThrow();
    });
}
