import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MigrationVersions } from "../entities/MigrationVersions";

export class GetMigrationVersionsUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(): Promise<MigrationVersions> {
        return this.repositoryFactory.migrationsRepository(this.localInstance).getAppVersion();
    }
}
