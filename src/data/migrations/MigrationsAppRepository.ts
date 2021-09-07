import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { Debug } from "../../domain/migrations/entities/Debug";
import { MigrationVersions } from "../../domain/migrations/entities/MigrationVersions";
import { MigrationsRepository } from "../../domain/migrations/repositories/MigrationsRepository";
import { cache } from "../../utils/cache";
import { MigrationsRunner } from "./client/MigrationsRunner";
import { AppStorage } from "./client/types";
import { getMigrationTasks, MigrationParams } from "./tasks";
import { promiseMap } from "../../utils/common";
import { Instance } from "../../domain/instance/entities/Instance";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { D2Api } from "../../types/d2-api";

export class MigrationsAppRepository implements MigrationsRepository {
    private d2Api: D2Api;

    constructor(private configRepository: ConfigRepository, localInstance: Instance) {
        this.d2Api = getD2APiFromInstance(localInstance);
    }

    public async runMigrations(debug: Debug): Promise<void> {
        const runner = await this.getMigrationsRunner();
        await runner.setDebug(debug).execute();
    }

    public async hasPendingMigrations(): Promise<boolean> {
        const runner = await this.getMigrationsRunner();
        return runner.hasPendingMigrations();
    }

    public async getAppVersion(): Promise<MigrationVersions> {
        const runner = await this.getMigrationsRunner();
        return { appVersion: runner.appVersion, instanceVersion: runner.instanceVersion };
    }

    @cache()
    private async getMigrationsRunner(): Promise<MigrationsRunner<MigrationParams>> {
        const storage = await this.getStorageClient();
        const migrations = await promiseMap(getMigrationTasks(), async ([version, module_]) => {
            return { version, ...(await module_).default };
        });

        return MigrationsRunner.init<MigrationParams>({
            storage,
            debug: console.debug,
            migrations,
            migrationParams: { d2Api: this.d2Api },
        });
    }

    private async getStorageClient(): Promise<AppStorage> {
        const storageClient = await this.configRepository.getStorageClient();

        return {
            get: <T extends object>(key: string) => storageClient.getObject<T>(key),
            getOrCreate: <T extends object>(key: string, defaultValue: T) =>
                storageClient.getOrCreateObject<T>(key, defaultValue),
            save: <T extends object>(key: string, value: T) => storageClient.saveObject<T>(key, value),
            remove: (key: string) => storageClient.removeObject(key),
            listKeys: () => storageClient.listKeys(),
        };
    }
}
