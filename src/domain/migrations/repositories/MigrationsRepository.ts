import { Debug } from "../entities/Debug";
import { MigrationVersions } from "../entities/MigrationVersions";

export interface MigrationsRepository {
    runMigrations(debug: Debug): Promise<void>;
    hasPendingMigrations(): Promise<boolean>;
    getAppVersion(): Promise<MigrationVersions>;
}
