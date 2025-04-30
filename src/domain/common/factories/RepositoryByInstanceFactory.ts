import { AggregatedRepository } from "../../aggregated/repositories/AggregatedRepository";
import { StorageClientRepository } from "../../storage-client-config/repositories/StorageClientRepository";
import { CustomDataRepository } from "../../custom-data/repository/CustomDataRepository";
import { DataStoreMetadataRepository } from "../../data-store/DataStoreMetadataRepository";
import { DhisReleasesRepository } from "../../dhis-releases/repository/DhisReleasesRepository";
import { EventsRepository } from "../../events/repositories/EventsRepository";
import { FileRepository } from "../../file/repositories/FileRepository";
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
import { TransformationRepository } from "../../transformations/repositories/TransformationRepository";
import { UserRepository } from "../../user/repositories/UserRepository";

export type ClassType = new (...args: any[]) => any;
export interface RepositoryByInstanceFactory {
    bind(repository: RepositoryKeys, implementation: ClassType, tag?: string): void;

    configRepository(instance: Instance): StorageClientRepository;
    storeRepository(instance: Instance): StoreRepository;
    instanceRepository(instance: Instance): InstanceRepository;
    instanceFileRepository(instance: Instance): InstanceFileRepository;
    userRepository(instance: Instance): UserRepository;
    transformationRepository(): TransformationRepository;
    metadataRepository(instance: DataSource): MetadataRepository;
    aggregatedRepository(instance: Instance): AggregatedRepository;
    eventsRepository(instance: Instance): EventsRepository;
    tableColumnsRepository(instance: Instance): TableColumnsRepository;
    dataStoreMetadataRepository(instance: Instance): DataStoreMetadataRepository;
    teisRepository(instance: Instance): TEIRepository;
    reportsRepository(instance: Instance): ReportsRepository;
    fileRepository(): FileRepository;
    rulesRepository(instance: Instance): RulesRepository;
    fileRulesRepository(instance: Instance): FileRulesRepository;
    customDataRepository(instance: Instance): CustomDataRepository;
    migrationsRepository(instance: Instance): MigrationsRepository;
    mappingRepository(instance: Instance): MappingRepository;
    settingsRepository(instance: Instance): SettingsRepository;
    dhisReleasesRepository(): DhisReleasesRepository;
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
    FileRepository: "fileRepository",
    ReportsRepository: "reportsRepository",
    RulesRepository: "rulesRepository",
    FileRulesRepository: "fileRulesRepository",
    SystemInfoRepository: "systemInfoRepository",
    MigrationsRepository: "migrationsRepository",
    TEIsRepository: "teisRepository",
    UserRepository: "userRepository",
    MappingRepository: "mappingRepository",
    SettingsRepository: "settingsRepository",
    DataStoreMetadataRepository: "dataStoreMetadataRepository",
    DhisReleasesRepository: "dhisReleasesRepository",
    TableColumnsRepository: "tableColumnsRepository",
} as const;
