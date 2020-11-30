import { AggregatedD2ApiRepository } from "../data/aggregated/AggregatedD2ApiRepository";
import { EventsD2ApiRepository } from "../data/events/EventsD2ApiRepository";
import { FileD2Repository } from "../data/file/FileD2Repository";
import { InstanceD2ApiRepository } from "../data/instance/InstanceD2ApiRepository";
import { MetadataD2ApiRepository } from "../data/metadata/MetadataD2ApiRepository";
import { MetadataJSONRepository } from "../data/metadata/MetadataJSONRepository";
import { GitHubOctokitRepository } from "../data/packages/GitHubOctokitRepository";
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
import { GetLocalInstanceUseCase } from "../domain/instance/usecases/GetLocalInstanceUseCase";
import { GetRootOrgUnitUseCase } from "../domain/instance/usecases/GetRootOrgUnitUseCase";
import { GetUserGroupsUseCase } from "../domain/instance/usecases/GetUserGroupsUseCase";
import { ListInstancesUseCase } from "../domain/instance/usecases/ListInstancesUseCase";
import { SaveInstanceUseCase } from "../domain/instance/usecases/SaveInstanceUseCase";
import { ValidateInstanceUseCase } from "../domain/instance/usecases/ValidateInstanceUseCase";
import { ApplyMappingUseCase } from "../domain/mapping/usecases/ApplyMappingUseCase";
import { AutoMapUseCase } from "../domain/mapping/usecases/AutoMapUseCase";
import { BuildMappingUseCase } from "../domain/mapping/usecases/BuildMappingUseCase";
import { GetMappingByOwnerUseCase } from "../domain/mapping/usecases/GetMappingByOwnerUseCase";
import { GetValidMappingIdUseCase } from "../domain/mapping/usecases/GetValidMappingIdUseCase";
import { SaveMappingUseCase } from "../domain/mapping/usecases/SaveMappingUseCase";
import { DeletedMetadataSyncUseCase } from "../domain/metadata/usecases/DeletedMetadataSyncUseCase";
import { GetResponsiblesUseCase } from "../domain/metadata/usecases/GetResponsiblesUseCase";
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
import { CancelPullRequestUseCase } from "../domain/notifications/usecases/CancelPullRequestUseCase";
import { ImportPullRequestUseCase } from "../domain/notifications/usecases/ImportPullRequestUseCase";
import { ListNotificationsUseCase } from "../domain/notifications/usecases/ListNotificationsUseCase";
import { MarkReadNotificationsUseCase } from "../domain/notifications/usecases/MarkReadNotificationsUseCase";
import { UpdatePullRequestStatusUseCase } from "../domain/notifications/usecases/UpdatePullRequestStatusUseCase";
import { ListImportedPackagesUseCase } from "../domain/package-import/usecases/ListImportedPackagesUseCase";
import { SaveImportedPackagesUseCase } from "../domain/package-import/usecases/SaveImportedPackagesUseCase";
import { CreatePackageUseCase } from "../domain/packages/usecases/CreatePackageUseCase";
import { DeletePackageUseCase } from "../domain/packages/usecases/DeletePackageUseCase";
import { DeleteStoreUseCase } from "../domain/packages/usecases/DeleteStoreUseCase";
import { DiffPackageUseCase } from "../domain/packages/usecases/DiffPackageUseCase";
import { DownloadPackageUseCase } from "../domain/packages/usecases/DownloadPackageUseCase";
import { GetPackageUseCase } from "../domain/packages/usecases/GetPackageUseCase";
import { GetStorePackageUseCase } from "../domain/packages/usecases/GetStorePackageUseCase";
import { GetStoreUseCase } from "../domain/packages/usecases/GetStoreUseCase";
import { ImportPackageUseCase } from "../domain/packages/usecases/ImportPackageUseCase";
import { ListPackagesUseCase } from "../domain/packages/usecases/ListPackagesUseCase";
import { ListStorePackagesUseCase } from "../domain/packages/usecases/ListStorePackagesUseCase";
import { ListStoresUseCase } from "../domain/packages/usecases/ListStoresUseCase";
import { PublishStorePackageUseCase } from "../domain/packages/usecases/PublishStorePackageUseCase";
import { SaveStoreUseCase } from "../domain/packages/usecases/SaveStoreUseCase";
import { SetStoreAsDefaultUseCase } from "../domain/packages/usecases/SetStoreAsDefaultUseCase";
import { ValidateStoreUseCase } from "../domain/packages/usecases/ValidateStoreUseCase";
import { Repositories } from "../domain/Repositories";
import { DownloadFileUseCase } from "../domain/storage/usecases/DownloadFileUseCase";
import { CreatePullRequestUseCase } from "../domain/synchronization/usecases/CreatePullRequestUseCase";
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
        this.repositoryFactory.bind(Repositories.FileRepository, FileD2Repository);
        this.repositoryFactory.bind(
            Repositories.MetadataRepository,
            MetadataJSONRepository,
            "json"
        );
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
                createPullRequest: new CreatePullRequestUseCase(
                    this.repositoryFactory,
                    this.localInstance
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
            get: new GetResponsiblesUseCase(this.repositoryFactory, this.localInstance),
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
            list: new ListStoresUseCase(storage),
            delete: new DeleteStoreUseCase(storage),
            setAsDefault: new SetStoreAsDefaultUseCase(storage),
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
            listStore: new ListStorePackagesUseCase(this.repositoryFactory, this.localInstance),
            create: new CreatePackageUseCase(this, this.repositoryFactory, this.localInstance),
            get: new GetPackageUseCase(this.repositoryFactory, this.localInstance),
            getStore: new GetStorePackageUseCase(this.repositoryFactory, this.localInstance),
            delete: new DeletePackageUseCase(this.repositoryFactory, this.localInstance),
            download: new DownloadPackageUseCase(this.repositoryFactory, this.localInstance),
            publish: new PublishStorePackageUseCase(this.repositoryFactory, this.localInstance),
            diff: new DiffPackageUseCase(this, this.repositoryFactory, this.localInstance),
            import: new ImportPackageUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get importedPackages() {
        return getExecute({
            list: new ListImportedPackagesUseCase(this.repositoryFactory, this.localInstance),
            save: new SaveImportedPackagesUseCase(this.repositoryFactory, this.localInstance),
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
            list: new ListNotificationsUseCase(
                this.repositoryFactory,
                this.localInstance,
                this.encryptionKey
            ),
            updatePullRequestStatus: new UpdatePullRequestStatusUseCase(
                this.repositoryFactory,
                this.localInstance
            ),
            markReadNotifications: new MarkReadNotificationsUseCase(
                this.repositoryFactory,
                this.localInstance
            ),
            importPullRequest: new ImportPullRequestUseCase(
                this.repositoryFactory,
                this.localInstance,
                this.encryptionKey
            ),
            cancelPullRequest: new CancelPullRequestUseCase(
                this.repositoryFactory,
                this.localInstance,
                this.encryptionKey
            ),
        });
    }

    @cache()
    public get instances() {
        return getExecute({
            getApi: new GetInstanceApiUseCase(this.repositoryFactory, this.localInstance),
            getLocal: new GetLocalInstanceUseCase(this.localInstance),
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
            getUserGroups: new GetUserGroupsUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get events() {
        const events = new EventsD2ApiRepository(this.localInstance);

        return getExecute({
            list: new ListEventsUseCase(events),
        });
    }

    @cache()
    public get mapping() {
        const storage = new StorageDataStoreRepository(this.localInstance);

        return getExecute({
            get: new GetMappingByOwnerUseCase(storage),
            save: new SaveMappingUseCase(storage),
            apply: new ApplyMappingUseCase(this.repositoryFactory, this.localInstance),
            getValidIds: new GetValidMappingIdUseCase(this.repositoryFactory, this.localInstance),
            autoMap: new AutoMapUseCase(this.repositoryFactory, this.localInstance),
            buildMapping: new BuildMappingUseCase(this.repositoryFactory, this.localInstance),
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
