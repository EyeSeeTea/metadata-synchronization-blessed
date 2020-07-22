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
import { RepositoryFactory } from "../domain/common/factories/RepositoryFactory";
import { EventsSyncUseCase } from "../domain/events/usecases/EventsSyncUseCase";
import { ListEventsUseCase } from "../domain/events/usecases/ListEventsUseCase";
import { Instance } from "../domain/instance/entities/Instance";
import { DeleteInstanceUseCase } from "../domain/instance/usecases/DeleteInstanceUseCase";
import { GetInstanceApiUseCase } from "../domain/instance/usecases/GetInstanceApiUseCase";
import { GetInstanceByIdUseCase } from "../domain/instance/usecases/GetInstanceByIdUseCase";
import { GetInstanceVersionUseCase } from "../domain/instance/usecases/GetInstanceVersionUseCase";
import { GetRootOrgUnitUseCase } from "../domain/instance/usecases/GetRootOrgUnitUseCase";
import { ListInstancesUseCase } from "../domain/instance/usecases/ListInstancesUseCase";
import { SaveInstanceUseCase } from "../domain/instance/usecases/SaveInstanceUseCase";
import { ValidateInstanceUseCase } from "../domain/instance/usecases/ValidateInstanceUseCase";
import { DeletedMetadataSyncUseCase } from "../domain/metadata/usecases/DeletedMetadataSyncUseCase";
import { GetResponsibleUseCase } from "../domain/metadata/usecases/GetResponsibleUseCase";
import { ImportMetadataUseCase } from "../domain/metadata/usecases/ImportMetadataUseCase";
import { ListAllMetadataUseCase } from "../domain/metadata/usecases/ListAllMetadataUseCase";
import { ListMetadataUseCase } from "../domain/metadata/usecases/ListMetadataUseCase";
import { ListResponsiblesUseCase } from "../domain/metadata/usecases/ListResponsiblesUseCase";
import { MetadataSyncUseCase } from "../domain/metadata/usecases/MetadataSyncUseCase";
import { SetResponsiblesUseCase } from "../domain/metadata/usecases/SetResponsiblesUseCase";
import { DeleteModuleUseCase } from "../domain/modules/usecases/DeleteModuleUseCase";
import { DownloadModuleSnapshotUseCase } from "../domain/modules/usecases/DownloadModuleSnapshotUseCase";
import { GetModuleUseCase } from "../domain/modules/usecases/GetModuleUseCase";
import { ListModulesUseCase } from "../domain/modules/usecases/ListModulesUseCase";
import { SaveModuleUseCase } from "../domain/modules/usecases/SaveModuleUseCase";
import { ListNotificationsUseCase } from "../domain/notifications/usecases/ListNotificationsUseCase";
import { MarkReadNotificationsUseCase } from "../domain/notifications/usecases/MarkReadNotificationsUseCase";
import { UpdatePullRequestStatusUseCase } from "../domain/notifications/usecases/UpdatePullRequestStatusUseCase";
import { CreatePackageUseCase } from "../domain/packages/usecases/CreatePackageUseCase";
import { DeletePackageUseCase } from "../domain/packages/usecases/DeletePackageUseCase";
import { DownloadPackageUseCase } from "../domain/packages/usecases/DownloadPackageUseCase";
import { GetPackageUseCase } from "../domain/packages/usecases/GetPackageUseCase";
import { GetStoreUseCase } from "../domain/packages/usecases/GetStoreUseCase";
import { ListPackagesUseCase } from "../domain/packages/usecases/ListPackagesUseCase";
import { SaveStoreUseCase } from "../domain/packages/usecases/SaveStoreUseCase";
import { ValidateStoreUseCase } from "../domain/packages/usecases/ValidateStoreUseCase";
import { Repositories } from "../domain/Repositories";
import { DownloadFileUseCase } from "../domain/storage/usecases/DownloadFileUseCase";
import { PrepareSyncUseCase } from "../domain/synchronization/usecases/PrepareSyncUseCase";
import { SynchronizationBuilder } from "../types/synchronization";
import { cache } from "../utils/cache";

export class CompositionRoot {
    private repositoryFactory: RepositoryFactory;

    constructor(public readonly localInstance: Instance, private encryptionKey: string) {
        this.repositoryFactory = new RepositoryFactory();
        this.repositoryFactory.bind(Repositories.InstanceRepository, InstanceD2ApiRepository);
        this.repositoryFactory.bind(Repositories.StorageRepository, StorageDataStoreRepository);
        this.repositoryFactory.bind(Repositories.DownloadRepository, DownloadWebRepository);
        this.repositoryFactory.bind(Repositories.GitHubRepository, GitHubOctokitRepository);
        this.repositoryFactory.bind(Repositories.AggregatedRepository, AggregatedD2ApiRepository);
        this.repositoryFactory.bind(Repositories.EventsRepository, EventsD2ApiRepository);
        this.repositoryFactory.bind(Repositories.MetadataRepository, MetadataD2ApiRepository);
        this.repositoryFactory.bind(
            Repositories.TransformationRepository,
            TransformationD2ApiRepository
        );
    }

    @cache()
    public get sync() {
        // TODO: Sync builder should be part of an execute method
        return {
            ...getExecute({
                prepare: new PrepareSyncUseCase(
                    this.repositoryFactory,
                    this.localInstance,
                    this.encryptionKey
                ),
            }),
            aggregated: (builder: SynchronizationBuilder) =>
                new AggregatedSyncUseCase(
                    builder,
                    this.repositoryFactory,
                    this.localInstance,
                    this.encryptionKey
                ),
            events: (builder: SynchronizationBuilder) =>
                new EventsSyncUseCase(
                    builder,
                    this.repositoryFactory,
                    this.localInstance,
                    this.encryptionKey
                ),
            metadata: (builder: SynchronizationBuilder) =>
                new MetadataSyncUseCase(
                    builder,
                    this.repositoryFactory,
                    this.localInstance,
                    this.encryptionKey
                ),
            deleted: (builder: SynchronizationBuilder) =>
                new DeletedMetadataSyncUseCase(
                    builder,
                    this.repositoryFactory,
                    this.localInstance,
                    this.encryptionKey
                ),
        };
    }

    @cache()
    public get metadata() {
        return getExecute({
            list: new ListMetadataUseCase(this.repositoryFactory, this.localInstance),
            listAll: new ListAllMetadataUseCase(this.repositoryFactory, this.localInstance),
            import: new ImportMetadataUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get responsibles() {
        return getExecute({
            get: new GetResponsibleUseCase(this.repositoryFactory, this.localInstance),
            set: new SetResponsiblesUseCase(this.repositoryFactory, this.localInstance),
            list: new ListResponsiblesUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get store() {
        const github = new GitHubOctokitRepository();
        const storage = new StorageDataStoreRepository(this.localInstance);

        return getExecute({
            get: new GetStoreUseCase(storage),
            update: new SaveStoreUseCase(github, storage),
            validate: new ValidateStoreUseCase(github),
        });
    }

    @cache()
    public get modules() {
        return getExecute({
            list: new ListModulesUseCase(this.repositoryFactory, this.localInstance),
            save: new SaveModuleUseCase(this.repositoryFactory, this.localInstance),
            get: new GetModuleUseCase(this.repositoryFactory, this.localInstance),
            delete: new DeleteModuleUseCase(this.repositoryFactory, this.localInstance),
            download: new DownloadModuleSnapshotUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get packages() {
        return getExecute({
            list: new ListPackagesUseCase(this.repositoryFactory, this.localInstance),
            create: new CreatePackageUseCase(this.repositoryFactory, this.localInstance),
            get: new GetPackageUseCase(this.repositoryFactory, this.localInstance),
            delete: new DeletePackageUseCase(this.repositoryFactory, this.localInstance),
            download: new DownloadPackageUseCase(this.repositoryFactory, this.localInstance),
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
    public get notifications() {
        return getExecute({
            list: new ListNotificationsUseCase(this.repositoryFactory, this.localInstance),
            updatePullRequestStatus: new UpdatePullRequestStatusUseCase(
                this.repositoryFactory,
                this.localInstance
            ),
            markReadNotifications: new MarkReadNotificationsUseCase(
                this.repositoryFactory,
                this.localInstance
            ),
        });
    }

    @cache()
    public get instances() {
        return getExecute({
            getApi: new GetInstanceApiUseCase(this.repositoryFactory, this.localInstance),
            list: new ListInstancesUseCase(
                this.repositoryFactory,
                this.localInstance,
                this.encryptionKey
            ),
            getById: new GetInstanceByIdUseCase(
                this.repositoryFactory,
                this.localInstance,
                this.encryptionKey
            ),
            save: new SaveInstanceUseCase(
                this.repositoryFactory,
                this.localInstance,
                this.encryptionKey
            ),
            delete: new DeleteInstanceUseCase(this.repositoryFactory, this.localInstance),
            validate: new ValidateInstanceUseCase(this.repositoryFactory),
            getVersion: new GetInstanceVersionUseCase(this.repositoryFactory, this.localInstance),
            getOrgUnitRoots: new GetRootOrgUnitUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get events() {
        const events = new EventsD2ApiRepository(this.localInstance);

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
