import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Repositories } from "../../Repositories";
import { Instance } from "../entities/Instance";
import { InstanceRepositoryConstructor } from "../repositories/InstanceRepository";

export class GetInstanceVersionUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(instance = this.localInstance): Promise<string> {
        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [instance, ""]
        );

        const buildVersion = await instanceRepository.getVersion();
        const [major, minor] = buildVersion.split(".");
        return `${major}.${minor}`;
    }
}
