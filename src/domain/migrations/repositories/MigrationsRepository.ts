import { StorageClientRepository } from "../../storage-client-config/repositories/StorageClientRepository";
import { Instance } from "../../instance/entities/Instance";
import { Debug } from "../entities/Debug";
import { MigrationVersions } from "../entities/MigrationVersions";

export interface MigrationsRepositoryConstructor {
    new (configRepository: StorageClientRepository, localInstance: Instance): MigrationsRepository;
}

export interface MigrationsRepository {
    runMigrations(debug: Debug): Promise<void>;
    hasPendingMigrations(): Promise<boolean>;
    getAppVersion(): Promise<MigrationVersions>;
}
