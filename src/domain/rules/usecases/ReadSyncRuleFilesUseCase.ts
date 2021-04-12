import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationRule } from "../entities/SynchronizationRule";

export class ReadSyncRuleFilesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(files: File[]): Promise<Either<string, SynchronizationRule>[]> {
        return this.repositoryFactory.fileRulesRepository(this.localInstance).readFiles(files);
    }
}
