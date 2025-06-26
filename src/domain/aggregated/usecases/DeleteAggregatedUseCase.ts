import { cache } from "../../../utils/cache";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { AggregatedPackage } from "../entities/AggregatedPackage";
import { AggregatedRepository } from "../repositories/AggregatedRepository";

export class DeleteAggregatedUseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory) {}

    async execute(instance: Instance, dataValues: AggregatedPackage): Promise<SynchronizationResult> {
        return this.getAggregatedRepository(instance).delete(dataValues);
    }

    @cache()
    protected getAggregatedRepository(instance: Instance): AggregatedRepository {
        return this.repositoryFactory.aggregatedRepository(instance);
    }
}
