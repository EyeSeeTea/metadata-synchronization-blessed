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
import { JSONDataSource } from "../../instance/entities/JSONDataSource";

export type RepositoryByInstanceCreator<T> = (instance: Instance) => T;
export type RepositoryByJsonSourceCreator<T> = (instance: JSONDataSource) => T;

export class DynamicRepositoryFactory {
    private repositoryCreators = new Map<string, RepositoryByInstanceCreator<unknown>>();

    private repositoryCreatorsByDataSource = new Map<string, RepositoryByJsonSourceCreator<unknown>>();
    private createdReposities = new Map<string, unknown>();

    public bindByInstance<T>(key: RepositoryKeys, creator: RepositoryByInstanceCreator<T>, tag = "default") {
        this.repositoryCreators.set(`${key}-${tag}`, creator);
    }

    public bindByJsonDataSource<T>(key: RepositoryKeys, creator: RepositoryByJsonSourceCreator<T>, tag = "default") {
        this.repositoryCreatorsByDataSource.set(`${key}-${tag}`, creator);
    }

    public configRepository(instance: Instance): StorageClientRepository {
        return this.getbyInstance(Repositories.ConfigRepository, instance);
    }

    public storeRepository(instance: Instance): StoreRepository {
        return this.getbyInstance(Repositories.StoreRepository, instance);
    }

    public instanceRepository(instance: Instance): InstanceRepository {
        return this.getbyInstance(Repositories.InstanceRepository, instance);
    }

    public instanceFileRepository(instance: Instance): InstanceFileRepository {
        return this.getbyInstance(Repositories.InstanceFileRepository, instance);
    }

    public userRepository(instance: Instance): UserRepository {
        return this.getbyInstance(Repositories.UserRepository, instance);
    }

    public metadataRepository(instance: DataSource): MetadataRepository {
        if (instance.type === "json") {
            return this.getByJsonDataSource(Repositories.MetadataRepository, instance as JSONDataSource, "json");
        } else {
            return this.getbyInstance(Repositories.MetadataRepository, instance);
        }
    }

    public aggregatedRepository(instance: Instance): AggregatedRepository {
        return this.getbyInstance(Repositories.AggregatedRepository, instance);
    }

    public eventsRepository(instance: Instance): EventsRepository {
        return this.getbyInstance(Repositories.EventsRepository, instance);
    }

    public tableColumnsRepository(instance: Instance): TableColumnsRepository {
        return this.getbyInstance(Repositories.TableColumnsRepository, instance);
    }

    public dataStoreMetadataRepository(instance: Instance): DataStoreMetadataRepository {
        return this.getbyInstance(Repositories.DataStoreMetadataRepository, instance);
    }

    public teisRepository(instance: Instance): TEIRepository {
        return this.getbyInstance(Repositories.TEIsRepository, instance);
    }

    public reportsRepository(instance: Instance): ReportsRepository {
        return this.getbyInstance(Repositories.ReportsRepository, instance);
    }

    public rulesRepository(instance: Instance): RulesRepository {
        return this.getbyInstance(Repositories.RulesRepository, instance);
    }

    public fileRulesRepository(instance: Instance): FileRulesRepository {
        return this.getbyInstance(Repositories.FileRulesRepository, instance);
    }

    public customDataRepository(instance: Instance): CustomDataRepository {
        return this.getbyInstance(Repositories.CustomDataRepository, instance);
    }

    public migrationsRepository(instance: Instance): MigrationsRepository {
        return this.getbyInstance(Repositories.MigrationsRepository, instance);
    }

    public mappingRepository(instance: Instance): MappingRepository {
        return this.getbyInstance(Repositories.MappingRepository, instance);
    }

    public settingsRepository(instance: Instance): SettingsRepository {
        return this.getbyInstance(Repositories.SettingsRepository, instance);
    }

    private getbyInstance<T>(key: RepositoryKeys, instance: Instance, tag = "default"): T {
        const creator = this.repositoryCreators.get(`${key}-${tag}`);

        if (!creator) {
            throw new Error(`Dependency ${key} is not registered`);
        }

        const createdRepository = this.createdReposities.get(`${key}-${tag}`) || creator(instance);

        this.createdReposities.set(key, createdRepository);

        return createdRepository as T;
    }

    private getByJsonDataSource<T>(key: RepositoryKeys, instance: JSONDataSource, tag = "default"): T {
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
