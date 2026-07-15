import { D2Api } from "../../types/d2-api";
import { JobConfiguration } from "../../domain/metadata/entities/MetadataEntities";

export async function getAggregatedDataExchangeJobConfigurations(
    api: D2Api,
    jobIds: string[]
): Promise<JobConfiguration[]> {
    if (jobIds.length === 0) {
        return [];
    }

    const response = await api
        .get<{ jobConfigurations: JobConfiguration[] }>(`jobConfigurations`, {
            filter: `id:in:[${jobIds.join(",")}]`,
            fields: "id,name,cronExpression,jobType,jobParameters,enabled",
        })
        .getData();

    return response.jobConfigurations;
}
