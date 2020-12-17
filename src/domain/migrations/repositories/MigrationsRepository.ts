import { ConfigRepository } from "../../config/repositories/ConfigRepository";
import { Debug } from "../entities/Debug";
import { MigrationVersions } from "../entities/MigrationVersions";

export interface MigrationsRepositoryConstructor {
    new (configRepository: ConfigRepository): MigrationsRepository;
}

export interface MigrationsRepository {
    runMigrations(debug: Debug): Promise<void>;
    hasPendingMigrations(): Promise<boolean>;
    getAppVersion(): Promise<MigrationVersions>;
}
