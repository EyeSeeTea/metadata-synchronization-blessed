import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationRule } from "../entities/SynchronizationRule";

export class ReadSyncRuleFilesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(files: File[]): Promise<SynchronizationRule[]> {
        return this.repositoryFactory.rulesRepository(this.localInstance).readFiles(files);
    }
}
