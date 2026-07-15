import { FutureData } from "../../../common/entities/Future";
import { DynamicRepositoryFactory } from "../../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../../instance/entities/Instance";
import { WmrRequisiteType } from "../entities/WmrRequisite";

export class SetupWmrRequisitesByTypeUseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    execute(requisiteType: WmrRequisiteType): FutureData<void> {
        return this.repositoryFactory.wmrRequisitesRepository(this.localInstance).setupRequisite(requisiteType);
    }
}
