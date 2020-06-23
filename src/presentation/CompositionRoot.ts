import { D2Api } from "d2-api/2.30";
import { AggregatedD2ApiRepository } from "../data/aggregated/AggregatedD2ApiRepository";
import { EventsD2ApiRepository } from "../data/events/EventsD2ApiRepository";
import { InstanceD2ApiRepository } from "../data/instance/InstanceD2ApiRepository";
import { MetadataD2ApiRepository } from "../data/metadata/MetadataD2ApiRepository";
import { GitHubOctokitRepository } from "../data/modules/GitHubOctokitRepository";
import { DownloadWebRepository } from "../data/storage/DownloadWebRepository";
import { StorageDataStoreRepository } from "../data/storage/StorageDataStoreRepository";
import { TransformationD2ApiRepository } from "../data/transformations/TransformationD2ApiRepository";
import { AggregatedSyncUseCase } from "../domain/aggregated/usecases/AggregatedSyncUseCase";
import { UseCase } from "../domain/common/entities/UseCase";
import { EventsSyncUseCase } from "../domain/events/usecases/EventsSyncUseCase";
import { ListEventsUseCase } from "../domain/events/usecases/ListEventsUseCase";
import { DeletedMetadataSyncUseCase } from "../domain/metadata/usecases/DeletedMetadataSyncUseCase";
import { MetadataSyncUseCase } from "../domain/metadata/usecases/MetadataSyncUseCase";
import { CreatePackageUseCase } from "../domain/modules/usecases/CreatePackageUseCase";
import { DeleteModuleUseCase } from "../domain/modules/usecases/DeleteModuleUseCase";
import { DeletePackageUseCase } from "../domain/modules/usecases/DeletePackageUseCase";
import { DownloadModuleUseCase } from "../domain/modules/usecases/DownloadModuleUseCase";
import { DownloadPackageUseCase } from "../domain/modules/usecases/DownloadPackageUseCase";
import { GetModuleUseCase } from "../domain/modules/usecases/GetModuleUseCase";
import { GetStoreUseCase } from "../domain/modules/usecases/GetStoreUseCase";
import { ListModulesUseCase } from "../domain/modules/usecases/ListModulesUseCase";
import { ListPackagesUseCase } from "../domain/modules/usecases/ListPackagesUseCase";
import { SaveModuleUseCase } from "../domain/modules/usecases/SaveModuleUseCase";
import { SaveStoreUseCase } from "../domain/modules/usecases/SaveStoreUseCase";
import { ValidateStoreUseCase } from "../domain/modules/usecases/ValidateStoreUseCase";
import { DownloadFileUseCase } from "../domain/storage/usecases/DownloadFileUseCase";
import { D2 } from "../types/d2";
import { SynchronizationBuilder } from "../types/synchronization";
import { cache } from "../utils/cache";

export const Repository = {
    AggregatedRepository: Symbol.for("aggregatedRepository"),
    EventsRepository: Symbol.for("eventsRepository"),
    MetadataRepository: Symbol.for("metadataRepository"),
    InstanceRepository: Symbol.for("instanceRepository"),
    TransformationRepository: Symbol.for("transformationsRepository"),
    StorageRepository: Symbol.for("storageRepository"),
    DownloadRepository: Symbol.for("downloadRepository"),
    GitHubRepository: Symbol.for("githubRepository"),
};

export class CompositionRoot {
    // TODO: Remove d2 and d2Api explicit calls so we do not have to expose them
    constructor(private d2Api: D2Api, private d2: D2, private encryptionKey: string) {}

    @cache()
    public get sync() {
        const instance = new InstanceD2ApiRepository(this.d2Api, this.encryptionKey);
        const transformation = new TransformationD2ApiRepository();
        const aggregated = new AggregatedD2ApiRepository(this.d2Api);
        const events = new EventsD2ApiRepository(this.d2Api);
        const metadata = new MetadataD2ApiRepository(this.d2Api, transformation);

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

    @cache()
    public get store() {
        const github = new GitHubOctokitRepository();
        const storage = new StorageDataStoreRepository(this.d2Api);

        return getExecute({
            get: new GetStoreUseCase(storage),
            update: new SaveStoreUseCase(github, storage),
            validate: new ValidateStoreUseCase(github),
        });
    }

    @cache()
    public get modules() {
        const storage = new StorageDataStoreRepository(this.d2Api);
        const download = new DownloadWebRepository();
        const instance = new InstanceD2ApiRepository(this.d2Api, this.encryptionKey);

        return getExecute({
            list: new ListModulesUseCase(storage),
            save: new SaveModuleUseCase(storage, instance),
            get: new GetModuleUseCase(storage),
            delete: new DeleteModuleUseCase(storage),
            download: new DownloadModuleUseCase(download),
        });
    }

    @cache()
    public get packages() {
        const storage = new StorageDataStoreRepository(this.d2Api);
        const github = new GitHubOctokitRepository();
        const download = new DownloadWebRepository();
        const instance = new InstanceD2ApiRepository(this.d2Api, this.encryptionKey);

        return getExecute({
            list: new ListPackagesUseCase(storage, github),
            create: new CreatePackageUseCase(storage, github, instance),
            delete: new DeletePackageUseCase(storage, github),
            download: new DownloadPackageUseCase(storage, download),
        });
    }

    @cache()
    public get storage() {
        const download = new DownloadWebRepository();

        return getExecute({
            downloadFile: new DownloadFileUseCase(download),
        });
    }

    @cache()
    public get events() {
        const events = new EventsD2ApiRepository(this.d2Api);

        return getExecute({
            list: new ListEventsUseCase(events),
        });
    }
}

function getExecute<UseCases extends Record<Key, UseCase>, Key extends keyof UseCases>(
    useCases: UseCases
): { [K in Key]: UseCases[K]["execute"] } {
    const keys = Object.keys(useCases) as Key[];
    const initialOutput = {} as { [K in Key]: UseCases[K]["execute"] };

    return keys.reduce((output, key) => {
        const useCase = useCases[key];
        const execute = useCase.execute.bind(useCase) as UseCases[typeof key]["execute"];
        output[key] = execute;
        return output;
    }, initialOutput);
}
