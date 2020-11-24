import { cache } from "../../../utils/cache";
import {
    AggregatedRepository,
    AggregatedRepositoryConstructor,
} from "../../aggregated/repositories/AggregatedRepository";
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
import { GitHubRepositoryConstructor } from "../../packages/repositories/GitHubRepository";
import { Repositories } from "../../Repositories";
import { DownloadRepositoryConstructor } from "../../storage/repositories/DownloadRepository";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageClient";
import { StoreRepositoryConstructor } from "../../stores/repositories/StoreRepository";
import {
    TransformationRepository,
    TransformationRepositoryConstructor,
} from "../../transformations/repositories/TransformationRepository";
import { RepositoryFactory } from "../factories/RepositoryFactory";

export interface UseCase {
    execute: Function;
}

export abstract class DefaultUseCase {
    constructor(protected repositoryFactory: RepositoryFactory) {}

    @cache()
    protected gitRepository() {
        return this.repositoryFactory.get<GitHubRepositoryConstructor>(
            Repositories.GitHubRepository,
            []
        );
    }

    @cache()
    protected storageRepository(instance: Instance) {
        return this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );
    }

    @cache()
    protected downloadRepository() {
        return this.repositoryFactory.get<DownloadRepositoryConstructor>(
            Repositories.DownloadRepository,
            []
        );
    }

    @cache()
    protected storeRepository(instance: Instance) {
        return this.repositoryFactory.get<StoreRepositoryConstructor>(
            Repositories.StoreRepository,
            [instance]
        );
    }

    @cache()
    protected instanceRepository(instance: Instance) {
        return this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [instance, ""]
        );
    }

    @cache()
    protected transformationRepository(): TransformationRepository {
        return this.repositoryFactory.get<TransformationRepositoryConstructor>(
            Repositories.TransformationRepository,
            []
        );
    }

    @cache()
    protected metadataRepository(instance: DataSource): MetadataRepository {
        const tag = instance.type === "json" ? "json" : undefined;

        return this.repositoryFactory.get<MetadataRepositoryConstructor>(
            Repositories.MetadataRepository,
            [instance, this.transformationRepository()],
            tag
        );
    }

    @cache()
    protected aggregatedRepository(instance: Instance): AggregatedRepository {
        return this.repositoryFactory.get<AggregatedRepositoryConstructor>(
            Repositories.AggregatedRepository,
            [instance]
        );
    }

    @cache()
    protected eventsRepository(instance: Instance): EventsRepository {
        return this.repositoryFactory.get<EventsRepositoryConstructor>(
            Repositories.EventsRepository,
            [instance]
        );
    }
}
