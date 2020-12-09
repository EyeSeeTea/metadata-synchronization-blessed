import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationRule } from "../entities/SynchronizationRule";

export class GetSyncRuleUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string): Promise<SynchronizationRule | undefined> {
        return this.repositoryFactory.rulesRepository(this.localInstance).getById(id);
    }
}
