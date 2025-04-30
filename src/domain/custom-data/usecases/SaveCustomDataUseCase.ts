import { UseCase } from "../../common/entities/UseCase";
import { RepositoryByInstanceFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { CustomData } from "../entities/CustomData";

export class SaveCustomDataUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryByInstanceFactory, private localInstance: Instance) {}

    public async execute<T extends CustomData>(customDataKey: string, customData: T): Promise<void> {
        await this.repositoryFactory.customDataRepository(this.localInstance).save(customDataKey, customData);
    }
}
