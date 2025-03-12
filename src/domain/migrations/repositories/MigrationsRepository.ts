import { Instance } from "../../instance/entities/Instance";
import { Debug } from "../entities/Debug";
import { MigrationVersions } from "../entities/MigrationVersions";
import { StorageClientFactory } from "../../../data/config/StorageClientFactory";

export interface MigrationsRepositoryConstructor {
    new (storageClientFactory: StorageClientFactory, localInstance: Instance): MigrationsRepository;
}

export interface MigrationsRepository {
    runMigrations(debug: Debug): Promise<void>;
    hasPendingMigrations(): Promise<boolean>;
    getAppVersion(): Promise<MigrationVersions>;
}
