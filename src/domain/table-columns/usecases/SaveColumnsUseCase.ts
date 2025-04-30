import { UseCase } from "../../common/entities/UseCase";
import { RepositoryByInstanceFactory } from "../../common/factories/RepositoryByInstanceFactory";
import { Instance } from "../../instance/entities/Instance";

export class SaveColumnsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryByInstanceFactory, protected localInstance: Instance) {}

    public async execute(namespace: string, columns: string[]): Promise<void> {
        return this.repositoryFactory.tableColumnsRepository(this.localInstance).saveColumns(namespace, columns);
    }
}
