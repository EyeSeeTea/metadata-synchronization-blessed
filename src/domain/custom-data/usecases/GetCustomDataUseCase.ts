import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { CustomData } from "../entities/CustomData";

export class GetCustomDataUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute<T extends CustomData>(key: string): Promise<T | undefined> {
        return this.repositoryFactory.customDataRepository(this.localInstance).get(key);
    }
}
