import { D2Api } from "../../types/d2-api";
import { AggregatedDataExchange } from "./models/AggregatedDataExchange";

export async function getAggregatedDataExchanges(
    api: D2Api,
    aggregatedDataExchangeIds: string[]
): Promise<AggregatedDataExchange[]> {
    const response = await api
        .get<{ aggregateDataExchanges: AggregatedDataExchange[] }>(`aggregateDataExchanges`, {
            filter: `id:in:[${aggregatedDataExchangeIds.join(",")}]`,
            fields: "id,name,source,target",
        })
        .getData();

    return response.aggregateDataExchanges;
}
