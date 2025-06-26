import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";

export class SaveColumnsUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, protected localInstance: Instance) {}

    public async execute(namespace: string, columns: string[]): Promise<void> {
        return this.repositoryFactory.tableColumnsRepository(this.localInstance).saveColumns(namespace, columns);
    }
}
