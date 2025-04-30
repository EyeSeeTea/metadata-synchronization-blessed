import { UseCase } from "../../common/entities/UseCase";
import { RepositoryByInstanceFactory } from "../../common/factories/RepositoryByInstanceFactory";
import { Instance } from "../entities/Instance";

export class GetInstanceVersionUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryByInstanceFactory, private localInstance: Instance) {}

    public async execute(instance = this.localInstance): Promise<string> {
        const buildVersion = await this.repositoryFactory.instanceRepository(instance).getVersion();
        const [major, minor] = buildVersion.split(".");
        return `${major}.${minor}`;
    }
}
