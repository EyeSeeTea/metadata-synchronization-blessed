import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";

export class SaveColumnsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, protected localInstance: Instance) {}

    public async execute(namespace: string, columns: string[]): Promise<void> {
        return this.repositoryFactory.tableColumnsRepository(this.localInstance).saveColumns(namespace, columns);
    }
}
