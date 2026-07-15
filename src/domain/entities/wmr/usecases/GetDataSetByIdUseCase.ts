import { Id } from "../../../common/entities/Schemas";
import { DynamicRepositoryFactory } from "../../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../../instance/entities/Instance";
import { WmrDataSet } from "../entities/WmrDataSet";

export class GetDataSetByIdUseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    execute(id: Id): Promise<WmrDataSet> {
        return this.repositoryFactory.wmrDataSetRepository(this.localInstance).getById(id);
    }
}
