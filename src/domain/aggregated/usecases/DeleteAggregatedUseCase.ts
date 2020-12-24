import { cache } from "../../../utils/cache";
import { Period } from "../../common/entities/Period";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { AggregatedRepository } from "../repositories/AggregatedRepository";
import { DataSynchronizationParams } from "../types";
import { buildPeriodFromParams } from "../utils";

export class DeleteAggregatedUseCase {
    constructor(private repositoryFactory: RepositoryFactory) {}

    async execute(
        orgUnitPaths: string[],
        dataElementGroupId: string,
        period: Period,
        instance: Instance
    ): Promise<SynchronizationResult> {
        const aggregatedRepository = this.getAggregatedRepository(instance);

        const [startDate, endDate] = buildPeriodFromParams({
            period: period.type,
            startDate: period.startDate,
            endDate: period.endDate,
        });

        const filters: DataSynchronizationParams = {
            startDate: startDate.toDate(),
            endDate: endDate.toDate(),
            orgUnitPaths,
        };

        const dataValuesToDelete = await aggregatedRepository.getAggregated(
            filters,
            [],
            [dataElementGroupId]
        );

        const result = aggregatedRepository.delete(dataValuesToDelete);

        return result;
    }

    @cache()
    protected getAggregatedRepository(instance: Instance): AggregatedRepository {
        return this.repositoryFactory.aggregatedRepository(instance);
    }
}
