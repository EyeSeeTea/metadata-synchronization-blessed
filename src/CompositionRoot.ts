import { D2Api } from "d2-api/2.30";
import { AggregatedD2ApiRepository } from "./data/aggregated/AggregatedD2ApiRepository";
import { EventsD2ApiRepository } from "./data/events/EventsD2ApiRepository";
import { InstanceD2ApiRepository } from "./data/instance/InstanceD2ApiRepository";
import { MetadataD2ApiRepository } from "./data/metadata/MetadataD2ApiRepository";
import { StorageDataStoreRepository } from "./data/storage/StorageDataStoreRepository";
import { TransformationD2ApiRepository } from "./data/transformations/TransformationD2ApiRepository";
import { AggregatedRepository } from "./domain/aggregated/repositories/AggregatedRepository";
import { AggregatedSyncUseCase } from "./domain/aggregated/usecases/AggregatedSyncUseCase";
import { TransformationRepository } from "./domain/common/repositories/TransformationRepository";
import { EventsRepository } from "./domain/events/repositories/EventsRepository";
import { EventsSyncUseCase } from "./domain/events/usecases/EventsSyncUseCase";
import { InstanceRepository } from "./domain/instance/repositories/InstanceRepository";
import { MetadataRepository } from "./domain/metadata/repositories/MetadataRepository";
import { DeletedMetadataSyncUseCase } from "./domain/metadata/usecases/DeletedMetadataSyncUseCase";
import { MetadataSyncUseCase } from "./domain/metadata/usecases/MetadataSyncUseCase";
import { D2 } from "./types/d2";
import { SynchronizationBuilder } from "./types/synchronization";
import { cache } from "./utils/cache";

export const Repository = {
    AggregatedRepository: Symbol.for("aggregatedRepository"),
    EventsRepository: Symbol.for("eventsRepository"),
    MetadataRepository: Symbol.for("metadataRepository"),
    InstanceRepository: Symbol.for("instanceRepository"),
    TransformationRepository: Symbol.for("transformationsRepository"),
    StorageRepository: Symbol.for("storageRepository"),
};

export class CompositionRoot {
    private dependencies = new Map();

    // TODO: Remove d2 and d2Api explicit calls so we do not have to expose them
    constructor(private d2Api: D2Api, private d2: D2, private encryptionKey: string) {
        this.initializeWebApp();
    }

    public get<T>(key: PropertyKey): T {
        return this.dependencies.get(key);
    }

    public bind<T>(key: PropertyKey, value: T) {
        this.dependencies.set(key, value);
    }

    @cache()
    public get sync() {
        const instance = this.get<InstanceRepository>(Repository.InstanceRepository);
        const aggregated = this.get<AggregatedRepository>(Repository.AggregatedRepository);
        const events = this.get<EventsRepository>(Repository.EventsRepository);
        const metadata = this.get<MetadataRepository>(Repository.MetadataRepository);
        const transformation = this.get<TransformationRepository>(
            Repository.TransformationRepository
        );

        // TODO: Sync builder should be part of an execute method
        return {
            aggregated: (builder: SynchronizationBuilder) =>
                new AggregatedSyncUseCase(
                    this.d2,
                    this.d2Api,
                    builder,
                    instance,
                    aggregated,
                    transformation
                ),
            events: (builder: SynchronizationBuilder) =>
                new EventsSyncUseCase(
                    this.d2,
                    this.d2Api,
                    builder,
                    instance,
                    events,
                    aggregated,
                    transformation
                ),
            metadata: (builder: SynchronizationBuilder) =>
                new MetadataSyncUseCase(this.d2, this.d2Api, builder, instance, metadata),
            deleted: (builder: SynchronizationBuilder) =>
                new DeletedMetadataSyncUseCase(this.d2, this.d2Api, builder, instance, metadata),
        };
    }

    private initializeWebApp() {
        const transformation = new TransformationD2ApiRepository();

        this.bind(Repository.StorageRepository, new StorageDataStoreRepository(this.d2Api));
        this.bind(
            Repository.InstanceRepository,
            new InstanceD2ApiRepository(this.d2Api, this.encryptionKey)
        );

        this.bind(Repository.TransformationRepository, transformation);
        this.bind(Repository.AggregatedRepository, new AggregatedD2ApiRepository(this.d2Api));
        this.bind(Repository.EventsRepository, new EventsD2ApiRepository(this.d2Api));
        this.bind(
            Repository.MetadataRepository,
            new MetadataD2ApiRepository(this.d2Api, transformation)
        );
    }
}
