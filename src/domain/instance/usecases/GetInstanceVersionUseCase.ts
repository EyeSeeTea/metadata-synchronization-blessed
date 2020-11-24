import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../entities/Instance";

export class GetInstanceVersionUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(instance = this.localInstance): Promise<string> {
        const buildVersion = await this.instanceRepository(instance).getVersion();
        const [major, minor] = buildVersion.split(".");
        return `${major}.${minor}`;
    }
}
