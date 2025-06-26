import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationRule } from "../entities/SynchronizationRule";

export class ReadSyncRuleFilesUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(files: File[]): Promise<Either<string, SynchronizationRule>[]> {
        return this.repositoryFactory.fileRulesRepository(this.localInstance).readFiles(files);
    }
}
