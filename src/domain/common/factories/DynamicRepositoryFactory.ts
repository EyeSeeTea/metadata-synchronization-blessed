import { AggregatedRepository } from "../../aggregated/repositories/AggregatedRepository";
import { StorageClientRepository } from "../../storage-client-config/repositories/StorageClientRepository";
import { CustomDataRepository } from "../../custom-data/repository/CustomDataRepository";
import { DataStoreMetadataRepository } from "../../data-store/DataStoreMetadataRepository";
import { EventsRepository } from "../../events/repositories/EventsRepository";
import { DataSource } from "../../instance/entities/DataSource";
import { Instance } from "../../instance/entities/Instance";
import { InstanceFileRepository } from "../../instance/repositories/InstanceFileRepository";
import { InstanceRepository } from "../../instance/repositories/InstanceRepository";
import { MappingRepository } from "../../mapping/repositories/MappingRepository";
import { MetadataRepository } from "../../metadata/repositories/MetadataRepository";
import { MigrationsRepository } from "../../migrations/repositories/MigrationsRepository";
import { ReportsRepository } from "../../reports/repositories/ReportsRepository";
import { FileRulesRepository } from "../../rules/repositories/FileRulesRepository";
import { RulesRepository } from "../../rules/repositories/RulesRepository";
import { SettingsRepository } from "../../settings/SettingsRepository";
import { StoreRepository } from "../../stores/repositories/StoreRepository";
import { TableColumnsRepository } from "../../table-columns/repositories/TableColumnsRepository";
import { TEIRepository } from "../../tracked-entity-instances/repositories/TEIRepository";
import { UserRepository } from "../../user/repositories/UserRepository";

export type RepositoryByInstanceCreator<T> = (instance: Instance) => T;
export type RepositoryByDataSourceCreator<T> = (instance: DataSource) => T;

export class DynamicRepositoryFactory {
    private repositoryCreators = new Map<string, RepositoryByInstanceCreator<unknown>>();

    private repositoryCreatorsByDataSource = new Map<string, RepositoryByDataSourceCreator<unknown>>();
    private createdReposities = new Map<string, unknown>();

    public bind<T>(key: RepositoryKeys, creator: RepositoryByInstanceCreator<T>, tag = "default") {
        this.repositoryCreators.set(`${key}-${tag}`, creator);
    }

    public bindByDataSource<T>(key: RepositoryKeys, creator: RepositoryByDataSourceCreator<T>, tag = "default") {
        this.repositoryCreatorsByDataSource.set(`${key}-${tag}`, creator);
    }

    public configRepository(instance: Instance): StorageClientRepository {
        return this.get(Repositories.ConfigRepository, instance);
    }

    public storeRepository(instance: Instance): StoreRepository {
        return this.get(Repositories.StoreRepository, instance);
    }

    public instanceRepository(instance: Instance): InstanceRepository {
        return this.get(Repositories.InstanceRepository, instance);
    }

    public instanceFileRepository(instance: Instance): InstanceFileRepository {
        return this.get(Repositories.InstanceFileRepository, instance);
    }

    public userRepository(instance: Instance): UserRepository {
        return this.get(Repositories.UserRepository, instance);
    }

    public metadataRepository(instance: DataSource): MetadataRepository {
        const tag = instance.type === "json" ? "json" : undefined;

        return this.getByDataSource(Repositories.MetadataRepository, instance, tag);
    }

    public aggregatedRepository(instance: Instance): AggregatedRepository {
        return this.get(Repositories.AggregatedRepository, instance);
    }

    public eventsRepository(instance: Instance): EventsRepository {
        return this.get(Repositories.EventsRepository, instance);
    }

    public tableColumnsRepository(instance: Instance): TableColumnsRepository {
        return this.get(Repositories.TableColumnsRepository, instance);
    }

    public dataStoreMetadataRepository(instance: Instance): DataStoreMetadataRepository {
        return this.get(Repositories.DataStoreMetadataRepository, instance);
    }

    public teisRepository(instance: Instance): TEIRepository {
        return this.get(Repositories.TEIsRepository, instance);
    }

    public reportsRepository(instance: Instance): ReportsRepository {
        return this.get(Repositories.ReportsRepository, instance);
    }

    public rulesRepository(instance: Instance): RulesRepository {
        return this.get(Repositories.RulesRepository, instance);
    }

    public fileRulesRepository(instance: Instance): FileRulesRepository {
        return this.get(Repositories.FileRulesRepository, instance);
    }

    public customDataRepository(instance: Instance): CustomDataRepository {
        return this.get(Repositories.CustomDataRepository, instance);
    }

    public migrationsRepository(instance: Instance): MigrationsRepository {
        return this.get(Repositories.MigrationsRepository, instance);
    }

    public mappingRepository(instance: Instance): MappingRepository {
        return this.get(Repositories.MappingRepository, instance);
    }

    public settingsRepository(instance: Instance): SettingsRepository {
        return this.get(Repositories.SettingsRepository, instance);
    }

    private get<T>(key: RepositoryKeys, instance: Instance, tag = "default"): T {
        const creator = this.repositoryCreators.get(`${key}-${tag}`);

        if (!creator) {
            throw new Error(`Dependency ${key} is not registered`);
        }

        const createdRepository = this.createdReposities.get(`${key}-${tag}`) || creator(instance);

        this.createdReposities.set(key, createdRepository);

        return createdRepository as T;
    }

    private getByDataSource<T>(key: RepositoryKeys, instance: DataSource, tag = "default"): T {
        const creator = this.repositoryCreatorsByDataSource.get(`${key}-${tag}`);

        if (!creator) {
            throw new Error(`Dependency ${key} is not registered`);
        }

        const createdRepository = this.createdReposities.get(`${key}-${tag}`) || creator(instance);

        this.createdReposities.set(key, createdRepository);

        return createdRepository as T;
    }
}

export type RepositoryKeys = typeof Repositories[keyof typeof Repositories];

export const Repositories = {
    InstanceRepository: "instanceRepository",
    InstanceFileRepository: "instanceFileRepository",
    StoreRepository: "storeRepository",
    ConfigRepository: "configRepository",
    CustomDataRepository: "customDataRepository",
    GitHubRepository: "githubRepository",
    AggregatedRepository: "aggregatedRepository",
    EventsRepository: "eventsRepository",
    MetadataRepository: "metadataRepository",
    TransformationRepository: "transformationsRepository",
    ReportsRepository: "reportsRepository",
    RulesRepository: "rulesRepository",
    FileRulesRepository: "fileRulesRepository",
    MigrationsRepository: "migrationsRepository",
    TEIsRepository: "teisRepository",
    UserRepository: "userRepository",
    MappingRepository: "mappingRepository",
    SettingsRepository: "settingsRepository",
    DataStoreMetadataRepository: "dataStoreMetadataRepository",
    DhisReleasesRepository: "dhisReleasesRepository",
    TableColumnsRepository: "tableColumnsRepository",
} as const;
