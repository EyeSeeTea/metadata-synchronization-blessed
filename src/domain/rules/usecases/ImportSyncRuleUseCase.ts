import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";

export class ImportSyncRuleUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(files: File[]): Promise<void> {
        console.log(files, this.localInstance, this.repositoryFactory);
    }
}
