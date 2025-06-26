import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";

export class HasPendingMigrationsUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(): Promise<boolean> {
        return this.repositoryFactory.migrationsRepository(this.localInstance).hasPendingMigrations();
    }
}
