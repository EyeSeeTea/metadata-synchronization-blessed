import { cache } from "../../../utils/cache";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { AggregatedPackage } from "../entities/AggregatedPackage";
import { AggregatedRepository } from "../repositories/AggregatedRepository";

export interface ListAggregatedFilters {
    orgUnitPaths: string[];
    startDate?: Date;
    endDate?: Date;
    lastUpdated?: Date;
}

export class ListAggregatedUseCase {
    constructor(private repositoryFactory: RepositoryFactory) {}

    async execute(
        instance: Instance,
        filters: ListAggregatedFilters,
        dataElementGroupId: string
    ): Promise<AggregatedPackage> {
        const aggregatedRepository = this.getAggregatedRepository(instance);

        return await aggregatedRepository.getAggregated(filters, [], [dataElementGroupId]);
    }

    @cache()
    protected getAggregatedRepository(instance: Instance): AggregatedRepository {
        return this.repositoryFactory.aggregatedRepository(instance);
    }
}
