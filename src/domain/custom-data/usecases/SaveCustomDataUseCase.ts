import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { CustomData } from "../entities/CustomData";

export class SaveCustomDataUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute<T extends CustomData>(customDataKey: string, customData: T): Promise<void> {
        await this.repositoryFactory.customDataRepository(this.localInstance).save(customDataKey, customData);
    }
}
