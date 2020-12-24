import { cache } from "../../../utils/cache";
import {
    AggregatedRepository,
    AggregatedRepositoryConstructor,
} from "../../aggregated/repositories/AggregatedRepository";
import { ConfigRepositoryConstructor } from "../../config/repositories/ConfigRepository";
import { CustomDataRepositoryConstructor } from "../../custom-data/repository/CustomDataRepository";
import {
    EventsRepository,
    EventsRepositoryConstructor,
} from "../../events/repositories/EventsRepository";
import { DataSource } from "../../instance/entities/DataSource";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import {
    MetadataRepository,
    MetadataRepositoryConstructor,
} from "../../metadata/repositories/MetadataRepository";
import { MigrationsRepositoryConstructor } from "../../migrations/repositories/MigrationsRepository";
import { GitHubRepositoryConstructor } from "../../packages/repositories/GitHubRepository";
import { ReportsRepositoryConstructor } from "../../reports/repositories/ReportsRepository";
import { RulesRepositoryConstructor } from "../../rules/repositories/RulesRepository";
import { DownloadRepositoryConstructor } from "../../storage/repositories/DownloadRepository";
import { StoreRepositoryConstructor } from "../../stores/repositories/StoreRepository";
import {
    TransformationRepository,
    TransformationRepositoryConstructor,
} from "../../transformations/repositories/TransformationRepository";

type ClassType = new (...args: any[]) => any;

export class RepositoryFactory {
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
    public gitRepository() {
        return this.get<GitHubRepositoryConstructor>(Repositories.GitHubRepository, []);
    }

    @cache()
    public configRepository(instance: Instance) {
        return this.get<ConfigRepositoryConstructor>(Repositories.ConfigRepository, [instance]);
    }

    @cache()
    public downloadRepository() {
        return this.get<DownloadRepositoryConstructor>(Repositories.DownloadRepository, []);
    }

    @cache()
    public storeRepository(instance: Instance) {
        const config = this.configRepository(instance);
        return this.get<StoreRepositoryConstructor>(Repositories.StoreRepository, [config]);
    }

    @cache()
    public instanceRepository(instance: Instance) {
        return this.get<InstanceRepositoryConstructor>(Repositories.InstanceRepository, [
            instance,
            this.encryptionKey,
        ]);
    }

    @cache()
    public transformationRepository(): TransformationRepository {
        return this.get<TransformationRepositoryConstructor>(
            Repositories.TransformationRepository,
            []
        );
    }

    @cache()
    public metadataRepository(instance: DataSource): MetadataRepository {
        const tag = instance.type === "json" ? "json" : undefined;

        return this.get<MetadataRepositoryConstructor>(
            Repositories.MetadataRepository,
            [instance, this.transformationRepository()],
            tag
        );
    }

    @cache()
    public aggregatedRepository(instance: Instance): AggregatedRepository {
        return this.get<AggregatedRepositoryConstructor>(Repositories.AggregatedRepository, [
            instance,
        ]);
    }

    @cache()
    public eventsRepository(instance: Instance): EventsRepository {
        return this.get<EventsRepositoryConstructor>(Repositories.EventsRepository, [instance]);
    }

    @cache()
    public reportsRepository(instance: Instance) {
        const config = this.configRepository(instance);
        return this.get<ReportsRepositoryConstructor>(Repositories.ReportsRepository, [config]);
    }

    @cache()
    public rulesRepository(instance: Instance) {
        const config = this.configRepository(instance);
        return this.get<RulesRepositoryConstructor>(Repositories.RulesRepository, [config]);
    }

    @cache()
    public customDataRepository(instance: Instance) {
        const config = this.configRepository(instance);
        return this.get<CustomDataRepositoryConstructor>(Repositories.CustomDataRepository, [
            config,
        ]);
    }

    @cache()
    public migrationsRepository(instance: Instance) {
        const config = this.configRepository(instance);
        return this.get<MigrationsRepositoryConstructor>(Repositories.MigrationsRepository, [
            config,
        ]);
    }
}

type RepositoryKeys = typeof Repositories[keyof typeof Repositories];

export const Repositories = {
    InstanceRepository: "instanceRepository",
    StoreRepository: "storeRepository",
    ConfigRepository: "configRepository",
    CustomDataRepository: "customDataRepository",
    DownloadRepository: "downloadRepository",
    GitHubRepository: "githubRepository",
    AggregatedRepository: "aggregatedRepository",
    EventsRepository: "eventsRepository",
    MetadataRepository: "metadataRepository",
    TransformationRepository: "transformationsRepository",
    FileRepository: "fileRepository",
    ReportsRepository: "reportsRepository",
    RulesRepository: "rulesRepository",
    SystemInfoRepository: "systemInfoRepository",
    MigrationsRepository: "migrationsRepository",
} as const;
