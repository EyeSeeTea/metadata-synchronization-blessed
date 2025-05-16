import { AggregatedRepository } from "../../../domain/aggregated/repositories/AggregatedRepository";
import {
    Repositories,
    RepositoryByInstanceFactory,
    RepositoryByInstanceCreator,
    RepositoryKeys,
    RepositoryByDataSourceCreator,
} from "../../../domain/common/factories/RepositoryByInstanceFactory";
import { CustomDataRepository } from "../../../domain/custom-data/repository/CustomDataRepository";
import { DataStoreMetadataRepository } from "../../../domain/data-store/DataStoreMetadataRepository";
import { EventsRepository } from "../../../domain/events/repositories/EventsRepository";
import { DataSource } from "../../../domain/instance/entities/DataSource";
import { Instance } from "../../../domain/instance/entities/Instance";
import { InstanceFileRepository } from "../../../domain/instance/repositories/InstanceFileRepository";
import { InstanceRepository } from "../../../domain/instance/repositories/InstanceRepository";
import { MappingRepository } from "../../../domain/mapping/repositories/MappingRepository";
import { MetadataRepository } from "../../../domain/metadata/repositories/MetadataRepository";
import { MigrationsRepository } from "../../../domain/migrations/repositories/MigrationsRepository";
import { ReportsRepository } from "../../../domain/reports/repositories/ReportsRepository";
import { FileRulesRepository } from "../../../domain/rules/repositories/FileRulesRepository";
import { RulesRepository } from "../../../domain/rules/repositories/RulesRepository";
import { SettingsRepository } from "../../../domain/settings/SettingsRepository";
import { StorageClientRepository } from "../../../domain/storage-client-config/repositories/StorageClientRepository";
import { StoreRepository } from "../../../domain/stores/repositories/StoreRepository";
import { TableColumnsRepository } from "../../../domain/table-columns/repositories/TableColumnsRepository";
import { TEIRepository } from "../../../domain/tracked-entity-instances/repositories/TEIRepository";
import { UserRepository } from "../../../domain/user/repositories/UserRepository";
export class DefaultRepositoryByInstanceFactory implements RepositoryByInstanceFactory {
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
