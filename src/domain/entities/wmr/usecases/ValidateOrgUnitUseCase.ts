import { FutureData } from "../../../common/entities/Future";
import { Id } from "../../../common/entities/Schemas";
import { DynamicRepositoryFactory } from "../../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../../instance/entities/Instance";

export class ValidateOrgUnitUseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory) {}

    execute(instance: Instance, orgUnitId: Id): FutureData<boolean> {
        return this.repositoryFactory.wmrRequisitesRepository(instance).validateOrgUnit(orgUnitId);
    }
}
