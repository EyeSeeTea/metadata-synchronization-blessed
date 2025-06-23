import { AggregatedD2ApiRepository } from "../data/aggregated/AggregatedD2ApiRepository";
import { StorageClientD2Repository } from "../data/config/StorageClientD2Repository";
import { CustomDataD2ApiRepository } from "../data/custom-data/CustomDataD2ApiRepository";
import { EventsD2ApiRepository } from "../data/events/EventsD2ApiRepository";
import { FileDataRepository } from "../data/file/FileDataRepository";
import { InstanceD2ApiRepository } from "../data/instance/InstanceD2ApiRepository";
import { InstanceFileD2Repository } from "../data/instance/InstanceFileD2Repository";
import { MappingD2ApiRepository } from "../data/mapping/MappingD2ApiRepository";
import { MetadataD2ApiRepository } from "../data/metadata/MetadataD2ApiRepository";
import { MetadataJSONRepository } from "../data/metadata/MetadataJSONRepository";
import { MigrationsAppRepository } from "../data/migrations/MigrationsAppRepository";
import { GitHubOctokitRepository } from "../data/packages/GitHubOctokitRepository";
import { ReportsD2ApiRepository } from "../data/reports/ReportsD2ApiRepository";
import { FileRulesDefaultRepository } from "../data/rules/FileRulesDefaultRepository";
import { RulesD2ApiRepository } from "../data/rules/RulesD2ApiRepository";
import { SchedulerExecutionInfoD2ApiRepository } from "../data/scheduler/SchedulerExecutionInfoD2ApiRepository";
import { SettingsD2ApiRepository } from "../data/settings/SettingsD2ApiRepository";
import { DownloadWebRepository } from "../data/storage/DownloadWebRepository";
import { StoreD2ApiRepository } from "../data/stores/StoreD2ApiRepository";
import { SystemInfoD2ApiRepository } from "../data/system-info/SystemInfoD2ApiRepository";
import { TEID2ApiRepository } from "../data/tracked-entity-instances/TEID2ApiRepository";
import { TransformationD2ApiRepository } from "../data/transformations/TransformationD2ApiRepository";
import { UserD2ApiRepository } from "../data/user/UserD2ApiRepository";
import { AggregatedSyncUseCase } from "../domain/aggregated/usecases/AggregatedSyncUseCase";
import { DeleteAggregatedUseCase } from "../domain/aggregated/usecases/DeleteAggregatedUseCase";
import { ListAggregatedUseCase } from "../domain/aggregated/usecases/ListAggregatedUseCase";
import { UseCase } from "../domain/common/entities/UseCase";
import { Repositories, DynamicRepositoryFactory } from "../domain/common/factories/DynamicRepositoryFactory";
import { StartApplicationUseCase } from "../domain/common/usecases/StartApplicationUseCase";
import { GetCustomDataUseCase } from "../domain/custom-data/usecases/GetCustomDataUseCase";
import { SaveCustomDataUseCase } from "../domain/custom-data/usecases/SaveCustomDataUseCase";
import { EventsSyncUseCase } from "../domain/events/usecases/EventsSyncUseCase";
import { ListEventsUseCase } from "../domain/events/usecases/ListEventsUseCase";
import { UpdateEmergencyResponseSyncRuleUseCase } from "../domain/events/usecases/UpdateEmergencyResponseSyncRuleUseCase";
import { Instance } from "../domain/instance/entities/Instance";
import { DeleteInstanceUseCase } from "../domain/instance/usecases/DeleteInstanceUseCase";
import { GetInstanceApiUseCase } from "../domain/instance/usecases/GetInstanceApiUseCase";
import { GetInstanceByIdUseCase } from "../domain/instance/usecases/GetInstanceByIdUseCase";
import { GetInstanceVersionUseCase } from "../domain/instance/usecases/GetInstanceVersionUseCase";
import { GetLocalInstanceUseCase } from "../domain/instance/usecases/GetLocalInstanceUseCase";
import { GetRootOrgUnitUseCase } from "../domain/instance/usecases/GetRootOrgUnitUseCase";
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
import { GetMetadataByIdsUseCase } from "../domain/metadata/usecases/GetMetadataByIdsUseCase";
import { GetResponsiblesUseCase } from "../domain/metadata/usecases/GetResponsiblesUseCase";
import { ImportMetadataUseCase } from "../domain/metadata/usecases/ImportMetadataUseCase";
import { ListAllMetadataUseCase } from "../domain/metadata/usecases/ListAllMetadataUseCase";
import { ListMetadataUseCase } from "../domain/metadata/usecases/ListMetadataUseCase";
import { ListResponsiblesUseCase } from "../domain/metadata/usecases/ListResponsiblesUseCase";
import { MetadataSyncUseCase } from "../domain/metadata/usecases/MetadataSyncUseCase";
import { SetResponsiblesUseCase } from "../domain/metadata/usecases/SetResponsiblesUseCase";
import { GetMigrationVersionsUseCase } from "../domain/migrations/usecases/GetMigrationVersionsUseCase";
import { HasPendingMigrationsUseCase } from "../domain/migrations/usecases/HasPendingMigrationsUseCase";
import { RunMigrationsUseCase } from "../domain/migrations/usecases/RunMigrationsUseCase";
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
import { DiffPackageUseCase } from "../domain/packages/usecases/DiffPackageUseCase";
import { DownloadPackageUseCase } from "../domain/packages/usecases/DownloadPackageUseCase";
import { ExtendsPackagesFromPackageUseCase } from "../domain/packages/usecases/ExtendsPackagesFromPackageUseCase";
import { GetPackageUseCase } from "../domain/packages/usecases/GetPackageUseCase";
import { GetStorePackageUseCase } from "../domain/packages/usecases/GetStorePackageUseCase";
import { ImportPackageUseCase } from "../domain/packages/usecases/ImportPackageUseCase";
import { ListPackagesUseCase } from "../domain/packages/usecases/ListPackagesUseCase";
import { ListStorePackagesUseCase } from "../domain/packages/usecases/ListStorePackagesUseCase";
import { PublishStorePackageUseCase } from "../domain/packages/usecases/PublishStorePackageUseCase";
import { ValidatePackageContentsUseCase } from "../domain/packages/usecases/ValidatePackageContentsUseCase";
import { CleanSyncReportsUseCase } from "../domain/reports/usecases/CleanSyncReporstUseCase";
import { DeleteOldSyncReportUseCase } from "../domain/reports/usecases/DeleteOldSyncReportUseCase";
import { DeleteSyncReportUseCase } from "../domain/reports/usecases/DeleteSyncReportUseCase";
import { DownloadPayloadUseCase } from "../domain/reports/usecases/DownloadPayloadUseCase";
import { GetSyncReportUseCase } from "../domain/reports/usecases/GetSyncReportUseCase";
import { GetSyncResultsUseCase } from "../domain/reports/usecases/GetSyncResultsUseCase";
import { ListSyncReportUseCase } from "../domain/reports/usecases/ListSyncReportUseCase";
import { SaveSyncReportUseCase } from "../domain/reports/usecases/SaveSyncReportUseCase";
import { DeleteSyncRuleUseCase } from "../domain/rules/usecases/DeleteSyncRuleUseCase";
import { ExportSyncRuleUseCase } from "../domain/rules/usecases/ExportSyncRuleUseCase";
import { GetSyncRuleUseCase } from "../domain/rules/usecases/GetSyncRuleUseCase";
import { ListSyncRuleUseCase } from "../domain/rules/usecases/ListSyncRuleUseCase";
import { ReadSyncRuleFilesUseCase } from "../domain/rules/usecases/ReadSyncRuleFilesUseCase";
import { SaveSyncRuleUseCase } from "../domain/rules/usecases/SaveSyncRuleUseCase";
import { GetLastSchedulerExecutionInfoUseCase } from "../domain/scheduler/usecases/GetLastSchedulerExecutionInfoUseCase";
import { UpdateSchedulerExecutionInfoUseCase } from "../domain/scheduler/usecases/UpdateSchedulerExecutionInfoUseCase";
import { DownloadFileUseCase } from "../domain/storage/usecases/DownloadFileUseCase";
import { DeleteStoreUseCase } from "../domain/stores/usecases/DeleteStoreUseCase";
import { GetStoreUseCase } from "../domain/stores/usecases/GetStoreUseCase";
import { ListStoresUseCase } from "../domain/stores/usecases/ListStoresUseCase";
import { SaveStoreUseCase } from "../domain/stores/usecases/SaveStoreUseCase";
import { SetStoreAsDefaultUseCase } from "../domain/stores/usecases/SetStoreAsDefaultUseCase";
import { ValidateStoreUseCase } from "../domain/stores/usecases/ValidateStoreUseCase";
import { SynchronizationBuilder } from "../domain/synchronization/entities/SynchronizationBuilder";
import { CreatePullRequestUseCase } from "../domain/synchronization/usecases/CreatePullRequestUseCase";
import { DownloadPayloadFromSyncRuleUseCase } from "../domain/synchronization/usecases/DownloadPayloadFromSyncRuleUseCase";
import { PrepareSyncUseCase } from "../domain/synchronization/usecases/PrepareSyncUseCase";
import { GetSystemInfoUseCase } from "../domain/system-info/usecases/GetSystemInfoUseCase";
import { ListTEIsUseCase } from "../domain/tracked-entity-instances/usecases/ListTEIsUseCase";
import { GetCurrentUserUseCase } from "../domain/user/usecases/GetCurrentUserUseCase";
import { cache } from "../utils/cache";
import { DataStoreMetadataD2Repository } from "../data/data-store/DataStoreMetadataD2Repository";
import { GetSupportedDhisVersionsUseCase } from "../domain/dhis-releases/usecases/GetSupportedDhisVersionsUseCase";
import { DhisReleasesLocalRepository } from "../data/dhis-releases/DhisReleasesLocalRepository";
import { GetColumnsUseCase } from "../domain/table-columns/usecases/GetColumnsUseCase";
import { SaveColumnsUseCase } from "../domain/table-columns/usecases/SaveColumnsUseCase";
import { TableColumnsDataStoreRepository } from "../data/table-columns/TableColumnsDataStoreRepository";
import { getD2APiFromInstance } from "../utils/d2-utils";
import { RoleD2ApiRepository } from "../data/role/RoleD2ApiRepository";
import { ValidateRolesUseCase } from "../domain/role/ValidateRolesUseCase";
import { StorageDataStoreClient } from "../data/storage/StorageDataStoreClient";
import { MetadataPayloadBuilder } from "../domain/metadata/builders/MetadataPayloadBuilder";
import { GitHubRepository } from "../domain/packages/repositories/GitHubRepository";
import { DownloadRepository } from "../domain/storage/repositories/DownloadRepository";
import { TransformationRepository } from "../domain/transformations/repositories/TransformationRepository";
import { EventsPayloadBuilder } from "../domain/events/builders/EventsPayloadBuilder";
import { AggregatedPayloadBuilder } from "../domain/aggregated/builders/AggregatedPayloadBuilder";
import { JSONDataSource } from "../domain/instance/entities/JSONDataSource";

/**
 * @deprecated CompositionRoot has been deprecated and will be removed in the future.
 * Please use NewCompositionRoot for all further development.
 */

export class CompositionRoot {
    private metadataPayloadBuilder: MetadataPayloadBuilder;
    private eventsPayloadBuilder: EventsPayloadBuilder;
    public readonly aggregatedPayloadBuilder: AggregatedPayloadBuilder;
    private repositoryFactory: DynamicRepositoryFactory;
    private gitHubRepository: GitHubRepository;
    private downloadRepository: DownloadRepository;
    private transformationRepository: TransformationRepository;

    constructor(public readonly localInstance: Instance, encryptionKey: string) {
        this.repositoryFactory = new DynamicRepositoryFactory();
        this.gitHubRepository = new GitHubOctokitRepository();
        this.downloadRepository = new DownloadWebRepository();
        this.transformationRepository = new TransformationD2ApiRepository();

        registerDynamicRepositoriesInFactory(this.repositoryFactory, encryptionKey);

        this.metadataPayloadBuilder = new MetadataPayloadBuilder(this.repositoryFactory, this.localInstance);
        this.eventsPayloadBuilder = new EventsPayloadBuilder(this.repositoryFactory, this.localInstance);
        this.aggregatedPayloadBuilder = new AggregatedPayloadBuilder(this.repositoryFactory, this.localInstance);
    }

    @cache()
    public get app() {
        return getExecute({
            initialize: new StartApplicationUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get aggregated() {
        return getExecute({
            list: new ListAggregatedUseCase(this.repositoryFactory),
            delete: new DeleteAggregatedUseCase(this.repositoryFactory),
        });
    }

    @cache()
    public get sync() {
        // TODO: Sync builder should be part of an execute method
        return {
            ...getExecute({
                prepare: new PrepareSyncUseCase(this.repositoryFactory, this.localInstance),
                createPullRequest: new CreatePullRequestUseCase(
                    this.repositoryFactory,
                    this.localInstance,
                    this.metadataPayloadBuilder
                ),
            }),
            aggregated: (builder: SynchronizationBuilder) =>
                new AggregatedSyncUseCase(
                    builder,
                    this.repositoryFactory,
                    this.localInstance,
                    this.aggregatedPayloadBuilder
                ),
            events: (builder: SynchronizationBuilder) =>
                new EventsSyncUseCase(
                    builder,
                    this.repositoryFactory,
                    this.localInstance,
                    this.eventsPayloadBuilder,
                    this.aggregatedPayloadBuilder
                ),
            metadata: (builder: SynchronizationBuilder) =>
                new MetadataSyncUseCase(
                    builder,
                    this.repositoryFactory,
                    this.localInstance,
                    this.metadataPayloadBuilder
                ),
            deleted: (builder: SynchronizationBuilder) =>
                new DeletedMetadataSyncUseCase(builder, this.repositoryFactory, this.localInstance),
        };
    }

    @cache()
    public get metadata() {
        return getExecute({
            list: new ListMetadataUseCase(this.repositoryFactory, this.localInstance),
            listAll: new ListAllMetadataUseCase(this.repositoryFactory, this.localInstance),
            getByIds: new GetMetadataByIdsUseCase(this.repositoryFactory, this.localInstance),
            import: new ImportMetadataUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get customData() {
        return getExecute({
            get: new GetCustomDataUseCase(this.repositoryFactory, this.localInstance),
            save: new SaveCustomDataUseCase(this.repositoryFactory, this.localInstance),
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
        return getExecute({
            get: new GetStoreUseCase(this.repositoryFactory, this.localInstance),
            update: new SaveStoreUseCase(this.repositoryFactory, this.gitHubRepository, this.localInstance),
            validate: new ValidateStoreUseCase(this.gitHubRepository),
            list: new ListStoresUseCase(this.repositoryFactory, this.localInstance),
            delete: new DeleteStoreUseCase(this.repositoryFactory, this.localInstance),
            setAsDefault: new SetStoreAsDefaultUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get modules() {
        return getExecute({
            list: new ListModulesUseCase(this.repositoryFactory, this.localInstance),
            save: new SaveModuleUseCase(this.repositoryFactory, this.localInstance),
            get: new GetModuleUseCase(this.repositoryFactory, this.localInstance),
            delete: new DeleteModuleUseCase(this.repositoryFactory, this.localInstance),
            download: new DownloadModuleSnapshotUseCase(
                this.repositoryFactory,
                this.localInstance,
                this.downloadRepository,
                this.metadataPayloadBuilder
            ),
        });
    }

    @cache()
    public get packages() {
        return getExecute({
            list: new ListPackagesUseCase(this.repositoryFactory, this.localInstance),
            listStore: new ListStorePackagesUseCase(
                this.repositoryFactory,
                new GitHubOctokitRepository(),
                this.localInstance
            ),
            create: new CreatePackageUseCase(
                this.metadataPayloadBuilder,
                this.repositoryFactory,
                this.transformationRepository,
                this.localInstance
            ),
            get: new GetPackageUseCase(this.repositoryFactory, this.localInstance),
            getStore: new GetStorePackageUseCase(this.repositoryFactory, this.gitHubRepository, this.localInstance),
            delete: new DeletePackageUseCase(this.repositoryFactory, this.localInstance),
            download: new DownloadPackageUseCase(
                this.repositoryFactory,
                this.gitHubRepository,
                this.downloadRepository,
                this.localInstance
            ),
            publish: new PublishStorePackageUseCase(this.repositoryFactory, this.gitHubRepository, this.localInstance),
            diff: new DiffPackageUseCase(
                this.metadataPayloadBuilder,
                this.repositoryFactory,
                this.gitHubRepository,
                this.localInstance
            ),
            import: new ImportPackageUseCase(this.repositoryFactory, this.localInstance),
            extend: new ExtendsPackagesFromPackageUseCase(
                this.repositoryFactory,
                this.transformationRepository,
                this.localInstance
            ),
            validate: new ValidatePackageContentsUseCase(this.repositoryFactory, this.localInstance),
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
        return getExecute({
            downloadFile: new DownloadFileUseCase(this.downloadRepository),
        });
    }

    @cache()
    public get notifications() {
        return getExecute({
            list: new ListNotificationsUseCase(this.repositoryFactory, this.localInstance),
            updatePullRequestStatus: new UpdatePullRequestStatusUseCase(this.repositoryFactory, this.localInstance),
            markReadNotifications: new MarkReadNotificationsUseCase(this.repositoryFactory, this.localInstance),
            importPullRequest: new ImportPullRequestUseCase(this.repositoryFactory, this.localInstance),
            cancelPullRequest: new CancelPullRequestUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get instances() {
        return getExecute({
            getApi: new GetInstanceApiUseCase(this.repositoryFactory, this.localInstance),
            getLocal: new GetLocalInstanceUseCase(this.localInstance),
            list: new ListInstancesUseCase(this.repositoryFactory, this.localInstance),
            getById: new GetInstanceByIdUseCase(this.repositoryFactory, this.localInstance),
            save: new SaveInstanceUseCase(this.repositoryFactory, this.localInstance),
            delete: new DeleteInstanceUseCase(this.repositoryFactory, this.localInstance),
            validate: new ValidateInstanceUseCase(this.repositoryFactory),
            getVersion: new GetInstanceVersionUseCase(this.repositoryFactory, this.localInstance),
            getOrgUnitRoots: new GetRootOrgUnitUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get systemInfo() {
        const systemInfoRepository = new SystemInfoD2ApiRepository(this.localInstance);

        return getExecute({
            get: new GetSystemInfoUseCase(systemInfoRepository),
        });
    }

    @cache()
    public get events() {
        return getExecute({
            list: new ListEventsUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get tableColumns() {
        return getExecute({
            getColumns: new GetColumnsUseCase(this.repositoryFactory, this.localInstance),
            saveColumns: new SaveColumnsUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get mapping() {
        return getExecute({
            get: new GetMappingByOwnerUseCase(this.repositoryFactory, this.localInstance),
            save: new SaveMappingUseCase(this.repositoryFactory, this.localInstance),
            apply: new ApplyMappingUseCase(this.repositoryFactory, this.localInstance),
            getValidIds: new GetValidMappingIdUseCase(this.repositoryFactory, this.localInstance),
            autoMap: new AutoMapUseCase(this.repositoryFactory, this.localInstance),
            buildMapping: new BuildMappingUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get reports() {
        return getExecute({
            list: new ListSyncReportUseCase(this.repositoryFactory, this.localInstance),
            save: new SaveSyncReportUseCase(this.repositoryFactory, this.localInstance),
            clean: new CleanSyncReportsUseCase(this.repositoryFactory, this.localInstance),
            delete: new DeleteSyncReportUseCase(this.repositoryFactory, this.localInstance),
            deleteOld: new DeleteOldSyncReportUseCase(
                this.repositoryFactory.reportsRepository(this.localInstance),
                this.repositoryFactory.settingsRepository(this.localInstance)
            ),
            get: new GetSyncReportUseCase(this.repositoryFactory, this.localInstance),
            getSyncResults: new GetSyncResultsUseCase(this.repositoryFactory, this.localInstance),
            downloadPayloads: new DownloadPayloadUseCase(
                this.repositoryFactory,
                this.downloadRepository,
                this.transformationRepository,
                this.localInstance
            ),
        });
    }

    @cache()
    public get rules() {
        return getExecute({
            list: new ListSyncRuleUseCase(this.repositoryFactory, this.localInstance),
            save: new SaveSyncRuleUseCase(this.repositoryFactory, this.localInstance),
            delete: new DeleteSyncRuleUseCase(this.repositoryFactory, this.localInstance),
            get: new GetSyncRuleUseCase(this.repositoryFactory, this.localInstance),
            readFiles: new ReadSyncRuleFilesUseCase(this.repositoryFactory, this.localInstance),
            export: new ExportSyncRuleUseCase(this.repositoryFactory, this.downloadRepository, this.localInstance),
            downloadPayloads: new DownloadPayloadFromSyncRuleUseCase(
                this,
                this.metadataPayloadBuilder,
                this.eventsPayloadBuilder,
                this.aggregatedPayloadBuilder,
                this.repositoryFactory,
                this.downloadRepository,
                this.transformationRepository,
                this.localInstance
            ),
        });
    }

    @cache()
    public get migrations() {
        return getExecute({
            run: new RunMigrationsUseCase(this.repositoryFactory, this.localInstance),
            getVersions: new GetMigrationVersionsUseCase(this.repositoryFactory, this.localInstance),
            hasPending: new HasPendingMigrationsUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get teis() {
        return getExecute({
            list: new ListTEIsUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get user() {
        return getExecute({
            current: new GetCurrentUserUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get scheduler() {
        const dataStoreClient = new StorageDataStoreClient(this.localInstance);

        return getExecute({
            getLastExecutionInfo: new GetLastSchedulerExecutionInfoUseCase(
                new SchedulerExecutionInfoD2ApiRepository(dataStoreClient)
            ),
            updateExecutionInfo: new UpdateSchedulerExecutionInfoUseCase(
                new SchedulerExecutionInfoD2ApiRepository(dataStoreClient)
            ),
        });
    }

    @cache()
    public get emergencyResponses() {
        return getExecute({
            updateSyncRule: new UpdateEmergencyResponseSyncRuleUseCase(this.repositoryFactory, this.localInstance),
        });
    }

    @cache()
    public get roles() {
        const api = getD2APiFromInstance(this.localInstance);

        return getExecute({
            validate: new ValidateRolesUseCase(new RoleD2ApiRepository(api)),
        });
    }

    @cache()
    public get dhisReleases() {
        return getExecute({
            getSupportedDhisVersions: new GetSupportedDhisVersionsUseCase(new DhisReleasesLocalRepository()),
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

export function registerDynamicRepositoriesInFactory(repositoryFactory: DynamicRepositoryFactory, encryptionKey = "") {
    repositoryFactory.bindByInstance(
        Repositories.ConfigRepository,
        (instance: Instance) => new StorageClientD2Repository(instance)
    );

    repositoryFactory.bindByInstance(Repositories.StoreRepository, (instance: Instance) => {
        const storageClient = repositoryFactory.configRepository(instance);

        return new StoreD2ApiRepository(storageClient);
    });

    repositoryFactory.bindByInstance(Repositories.InstanceRepository, (instance: Instance) => {
        const storageClient = repositoryFactory.configRepository(instance);

        return new InstanceD2ApiRepository(storageClient, instance, encryptionKey);
    });

    repositoryFactory.bindByInstance(
        Repositories.InstanceFileRepository,
        (instance: Instance) => new InstanceFileD2Repository(instance)
    );

    repositoryFactory.bindByInstance(
        Repositories.UserRepository,
        (instance: Instance) => new UserD2ApiRepository(instance)
    );

    repositoryFactory.bindByInstance(
        Repositories.MetadataRepository,
        (instance: Instance) => new MetadataD2ApiRepository(instance, new TransformationD2ApiRepository())
    );

    repositoryFactory.bindByJsonDataSource(
        Repositories.MetadataRepository,
        (instance: JSONDataSource) => new MetadataJSONRepository(instance, new TransformationD2ApiRepository())
    );

    repositoryFactory.bindByInstance(
        Repositories.AggregatedRepository,
        (instance: Instance) => new AggregatedD2ApiRepository(instance)
    );

    repositoryFactory.bindByInstance(
        Repositories.EventsRepository,
        (instance: Instance) => new EventsD2ApiRepository(instance)
    );

    repositoryFactory.bindByInstance(Repositories.TableColumnsRepository, (instance: Instance) => {
        const storageClient = repositoryFactory.configRepository(instance);

        return new TableColumnsDataStoreRepository(storageClient);
    });

    repositoryFactory.bindByInstance(
        Repositories.TEIsRepository,
        (instance: Instance) => new TEID2ApiRepository(instance)
    );

    repositoryFactory.bindByInstance(Repositories.ReportsRepository, (instance: Instance) => {
        const storageClient = repositoryFactory.configRepository(instance);

        return new ReportsD2ApiRepository(storageClient);
    });

    repositoryFactory.bindByInstance(Repositories.RulesRepository, (instance: Instance) => {
        const storageClient = repositoryFactory.configRepository(instance);
        const user = repositoryFactory.userRepository(instance);

        return new RulesD2ApiRepository(storageClient, user);
    });

    repositoryFactory.bindByInstance(Repositories.FileRulesRepository, (instance: Instance) => {
        const file = new FileDataRepository();
        const user = repositoryFactory.userRepository(instance);

        return new FileRulesDefaultRepository(user, file);
    });

    repositoryFactory.bindByInstance(Repositories.CustomDataRepository, (instance: Instance) => {
        const storageClient = repositoryFactory.configRepository(instance);

        return new CustomDataD2ApiRepository(storageClient);
    });

    repositoryFactory.bindByInstance(Repositories.MigrationsRepository, (instance: Instance) => {
        const storageClient = repositoryFactory.configRepository(instance);

        return new MigrationsAppRepository(storageClient, instance);
    });

    repositoryFactory.bindByInstance(Repositories.MappingRepository, (instance: Instance) => {
        const storageClient = repositoryFactory.configRepository(instance);

        return new MappingD2ApiRepository(storageClient);
    });

    repositoryFactory.bindByInstance(Repositories.SettingsRepository, (instance: Instance) => {
        const storageClient = repositoryFactory.configRepository(instance);

        return new SettingsD2ApiRepository(storageClient);
    });

    repositoryFactory.bindByInstance(
        Repositories.DataStoreMetadataRepository,
        (instance: Instance) => new DataStoreMetadataD2Repository(instance)
    );
}
