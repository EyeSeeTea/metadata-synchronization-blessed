import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";

export class GetColumnsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, protected localInstance: Instance) {}

    public async execute(namespace: string): Promise<string[]> {
        return this.repositoryFactory.tableColumnsRepository(this.localInstance).getColumns(namespace);
    }
}
