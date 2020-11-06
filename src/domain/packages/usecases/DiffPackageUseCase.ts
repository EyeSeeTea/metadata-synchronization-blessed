import { cache } from "../../../utils/cache";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
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
        packageIdBase: string | undefined,
        packageIdMerge: string,
        storeId: string | undefined,
        instance = this.localInstance
    ): Promise<Either<DiffPackageUseCaseError, MetadataPackageDiff>> {
        const packageMerge = await this.getPackage(packageIdMerge, storeId, instance);
        if (!packageMerge) return Either.error("PACKAGE_NOT_FOUND");

        const contentsMerge = packageMerge.contents;
        let contentsBase: MetadataPackage;

        if (packageIdBase) {
            const packageBase = await this.getPackage(packageIdBase, storeId, instance);
            if (!packageBase) return Either.error("PACKAGE_NOT_FOUND");
            contentsBase = packageBase.contents;
        } else {
            // No package B specified, use local contents
            const moduleDataMerge = await this.storageRepository(instance).getObjectInCollection<
                BaseModule
            >(Namespace.MODULES, packageMerge.module.id);

            if (!moduleDataMerge) return Either.error("MODULE_NOT_FOUND");
            const moduleMerge = MetadataModule.build(moduleDataMerge);

            contentsBase = await this.compositionRoot.sync[moduleMerge.type]({
                ...moduleMerge.toSyncBuilder(),
                originInstance: "LOCAL",
                targetInstances: [],
            }).buildPayload();
        }

        return Either.success(getMetadataPackageDiff(contentsBase, contentsMerge));
    }

    private async getPackage(
        packageId: string,
        storeId: string | undefined,
        instance: Instance
    ): Promise<BasePackage | undefined> {
        return storeId
            ? this.getStorePackage(storeId, packageId)
            : this.getDataStorePackage(packageId, instance);
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

        const { encoding, content } = await this.gitRepository().request<{
            encoding: string;
            content: string;
        }>(store, url);

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
}
