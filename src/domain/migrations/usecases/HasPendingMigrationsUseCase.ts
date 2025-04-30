import { UseCase } from "../../common/entities/UseCase";
import { RepositoryByInstanceFactory } from "../../common/factories/RepositoryByInstanceFactory";
import { Instance } from "../../instance/entities/Instance";

export class HasPendingMigrationsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryByInstanceFactory, private localInstance: Instance) {}

    public async execute(): Promise<boolean> {
        return this.repositoryFactory.migrationsRepository(this.localInstance).hasPendingMigrations();
    }
}
