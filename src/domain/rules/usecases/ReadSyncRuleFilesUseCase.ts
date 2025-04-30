import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryByInstanceFactory } from "../../common/factories/RepositoryByInstanceFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationRule } from "../entities/SynchronizationRule";

export class ReadSyncRuleFilesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryByInstanceFactory, private localInstance: Instance) {}

    public async execute(files: File[]): Promise<Either<string, SynchronizationRule>[]> {
        return this.repositoryFactory.fileRulesRepository(this.localInstance).readFiles(files);
    }
}
