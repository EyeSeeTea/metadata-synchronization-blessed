import {
    AggregatedRepository,
    AggregatedRepositoryConstructor,
} from "../../../domain/aggregated/repositories/AggregatedRepository";
import {
    ClassType,
    Repositories,
    RepositoryByInstanceFactory,
    RepositoryKeys,
} from "../../../domain/common/factories/RepositoryByInstanceFactory";
import { CustomDataRepositoryConstructor } from "../../../domain/custom-data/repository/CustomDataRepository";
import { DataStoreMetadataRepositoryConstructor } from "../../../domain/data-store/DataStoreMetadataRepository";
import { DhisReleasesRepositoryConstructor } from "../../../domain/dhis-releases/repository/DhisReleasesRepository";
import { EventsRepository, EventsRepositoryConstructor } from "../../../domain/events/repositories/EventsRepository";
import { DataSource } from "../../../domain/instance/entities/DataSource";
import { Instance } from "../../../domain/instance/entities/Instance";
import { InstanceFileRepositoryConstructor } from "../../../domain/instance/repositories/InstanceFileRepository";
import { InstanceRepositoryConstructor } from "../../../domain/instance/repositories/InstanceRepository";
import { MappingRepositoryConstructor } from "../../../domain/mapping/repositories/MappingRepository";
import {
    MetadataRepository,
    MetadataRepositoryConstructor,
} from "../../../domain/metadata/repositories/MetadataRepository";
import { MigrationsRepositoryConstructor } from "../../../domain/migrations/repositories/MigrationsRepository";
import { ReportsRepositoryConstructor } from "../../../domain/reports/repositories/ReportsRepository";
import { FileRulesRepositoryConstructor } from "../../../domain/rules/repositories/FileRulesRepository";
import { RulesRepositoryConstructor } from "../../../domain/rules/repositories/RulesRepository";
import { SettingsRepositoryConstructor } from "../../../domain/settings/SettingsRepository";
import { StorageClientRepositoryConstructor } from "../../../domain/storage-client-config/repositories/StorageClientRepository";
import { StoreRepositoryConstructor } from "../../../domain/stores/repositories/StoreRepository";
import {
    TableColumnsRepository,
    TableColumnsRepositoryConstructor,
} from "../../../domain/table-columns/repositories/TableColumnsRepository";
import {
    TEIRepository,
    TEIRepositoryConstructor,
} from "../../../domain/tracked-entity-instances/repositories/TEIRepository";
import { UserRepositoryConstructor } from "../../../domain/user/repositories/UserRepository";
import { cache } from "../../../utils/cache";
import { FileDataRepository } from "../../file/FileDataRepository";
import { TransformationD2ApiRepository } from "../../transformations/TransformationD2ApiRepository";

export class DefaultRepositoryByInstanceFactory implements RepositoryByInstanceFactory {
    constructor(private encryptionKey: string) {}

    private repositories: Map<string, ClassType> = new Map(); // TODO: TS 4.1 `${RepositoryKeys}-${string}`

    public bind(repository: RepositoryKeys, implementation: ClassType, tag = "default") {
        this.repositories.set(`${repository}-${tag}`, implementation);
    }

    @cache()
    public get<Constructor extends ClassType, Key extends string = string>(
        repository: RepositoryKeys,
        params: ConstructorParameters<Constructor>,
        tag?: Key
    ): InstanceType<Constructor> {
        const repositoryName = `${repository}-${tag ?? "default"}`;
        const Implementation = this.repositories.get(repositoryName);
        if (!Implementation) throw new Error(`Repository ${repositoryName} not found`);
        return new Implementation(...params);
    }

    @cache()
    public configRepository(instance: Instance) {
        return this.get<StorageClientRepositoryConstructor>(Repositories.ConfigRepository, [instance]);
    }

    @cache()
    public storeRepository(instance: Instance) {
        const config = this.configRepository(instance);
        return this.get<StoreRepositoryConstructor>(Repositories.StoreRepository, [config]);
    }

    @cache()
    public instanceRepository(instance: Instance) {
        const config = this.configRepository(instance);

        return this.get<InstanceRepositoryConstructor>(Repositories.InstanceRepository, [
            config,
            instance,
            this.encryptionKey,
        ]);
    }

    @cache()
    public instanceFileRepository(instance: Instance) {
        return this.get<InstanceFileRepositoryConstructor>(Repositories.InstanceFileRepository, [instance]);
    }

    @cache()
    public userRepository(instance: Instance) {
        return this.get<UserRepositoryConstructor>(Repositories.UserRepository, [instance]);
    }

    @cache()
    public metadataRepository(instance: DataSource): MetadataRepository {
        const tag = instance.type === "json" ? "json" : undefined;

        return this.get<MetadataRepositoryConstructor>(
            Repositories.MetadataRepository,
            [instance, new TransformationD2ApiRepository()],
            tag
        );
    }

    @cache()
    public aggregatedRepository(instance: Instance): AggregatedRepository {
        return this.get<AggregatedRepositoryConstructor>(Repositories.AggregatedRepository, [instance]);
    }

    @cache()
    public eventsRepository(instance: Instance): EventsRepository {
        return this.get<EventsRepositoryConstructor>(Repositories.EventsRepository, [instance]);
    }

    @cache()
    public tableColumnsRepository(instance: Instance): TableColumnsRepository {
        const config = this.configRepository(instance);

        return this.get<TableColumnsRepositoryConstructor>(Repositories.TableColumnsRepository, [config]);
    }

    @cache()
    public dataStoreMetadataRepository(instance: Instance) {
        return this.get<DataStoreMetadataRepositoryConstructor>(Repositories.DataStoreMetadataRepository, [instance]);
    }

    @cache()
    public teisRepository(instance: Instance): TEIRepository {
        return this.get<TEIRepositoryConstructor>(Repositories.TEIsRepository, [instance]);
    }

    @cache()
    public reportsRepository(instance: Instance) {
        const config = this.configRepository(instance);
        return this.get<ReportsRepositoryConstructor>(Repositories.ReportsRepository, [config]);
    }

    @cache()
    public rulesRepository(instance: Instance) {
        const config = this.configRepository(instance);
        const user = this.userRepository(instance);

        return this.get<RulesRepositoryConstructor>(Repositories.RulesRepository, [config, user]);
    }

    @cache()
    public fileRulesRepository(instance: Instance) {
        const user = this.userRepository(instance);
        const file = new FileDataRepository();

        return this.get<FileRulesRepositoryConstructor>(Repositories.FileRulesRepository, [user, file]);
    }

    @cache()
    public customDataRepository(instance: Instance) {
        const config = this.configRepository(instance);
        return this.get<CustomDataRepositoryConstructor>(Repositories.CustomDataRepository, [config]);
    }

    @cache()
    public migrationsRepository(instance: Instance) {
        const config = this.configRepository(instance);
        return this.get<MigrationsRepositoryConstructor>(Repositories.MigrationsRepository, [config, instance]);
    }

    @cache()
    public mappingRepository(instance: Instance) {
        const config = this.configRepository(instance);

        return this.get<MappingRepositoryConstructor>(Repositories.MappingRepository, [config]);
    }

    @cache()
    public settingsRepository(instance: Instance) {
        const config = this.configRepository(instance);
        return this.get<SettingsRepositoryConstructor>(Repositories.SettingsRepository, [config]);
    }

    @cache()
    public dhisReleasesRepository() {
        return this.get<DhisReleasesRepositoryConstructor>(Repositories.DhisReleasesRepository, []);
    }
}
