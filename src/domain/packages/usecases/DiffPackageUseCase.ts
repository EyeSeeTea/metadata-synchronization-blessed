import { cache } from "../../../utils/cache";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { DownloadRepositoryConstructor } from "../../storage/repositories/DownloadRepository";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { getMetadataPackageDiff, MetadataPackageDiff } from "../entities/MetadataPackageDiff";
import { Store } from "../entities/Store";
import { GitHubRepositoryConstructor } from "../repositories/GitHubRepository";
import { CompositionRoot } from "./../../../presentation/CompositionRoot";
import { Either } from "./../../common/entities/Either";
import { MetadataModule } from "./../../modules/entities/MetadataModule";
import { BaseModule } from "./../../modules/entities/Module";
import { BasePackage } from "./../entities/Package";

type DiffPackageUseCaseError = "PACKAGE_NOT_FOUND" | "MODULE_NOT_FOUND" | "NETWORK_ERROR";

export class DiffPackageUseCase implements UseCase {
    constructor(
        private compositionRoot: CompositionRoot,
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance
    ) {}

    public async execute(
        storeId: string | undefined,
        id: string,
        instance = this.localInstance
    ): Promise<Either<DiffPackageUseCaseError, MetadataPackageDiff>> {
        const remotePackage = storeId
            ? await this.getStorePackage(storeId, id)
            : await this.getDataStorePackage(id, instance);

        if (!remotePackage) return Either.error("PACKAGE_NOT_FOUND");

        const moduleData = await this.storageRepository(instance).getObjectInCollection<BaseModule>(
            Namespace.MODULES,
            remotePackage.module.id
        );

        if (!moduleData) return Either.error("MODULE_NOT_FOUND");

        const remoteModule = MetadataModule.build(moduleData);
        const localContents = await this.compositionRoot.sync[remoteModule.type]({
            ...remoteModule.toSyncBuilder(),
            originInstance: "LOCAL",
            targetInstances: [],
        }).buildPayload();

        return Either.success(getMetadataPackageDiff(localContents, remotePackage.contents));
    }

    private async getDataStorePackage(id: string, instance: Instance) {
        return this.storageRepository(instance).getObjectInCollection<BasePackage>(
            Namespace.PACKAGES,
            id
        );
    }

    private async getStorePackage(storeId: string, url: string) {
        const store = (
            await this.storageRepository(this.localInstance).getObject<Store[]>(Namespace.STORES)
        )?.find(store => store.id === storeId);

        if (!store) return undefined;

        const { encoding, content } = await this.downloadRepository().fetch<{
            encoding: string;
            content: string;
        }>(url);

        const validation = this.gitRepository().readFileContents<
            MetadataPackage & { package: BasePackage }
        >(encoding, content);
        if (!validation.value.data) return undefined;

        const { package: basePackage, ...contents } = validation.value.data;
        return { ...basePackage, contents };
    }

    @cache()
    private gitRepository() {
        return this.repositoryFactory.get<GitHubRepositoryConstructor>(
            Repositories.GitHubRepository,
            []
        );
    }

    @cache()
    private storageRepository(instance: Instance) {
        return this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );
    }

    @cache()
    private downloadRepository() {
        return this.repositoryFactory.get<DownloadRepositoryConstructor>(
            Repositories.DownloadRepository,
            []
        );
    }
}
