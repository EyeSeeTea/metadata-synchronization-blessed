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
        packageIdA: string,
        packageIdB: string | undefined,
        storeId: string | undefined,
        instance = this.localInstance
    ): Promise<Either<DiffPackageUseCaseError, MetadataPackageDiff>> {
        const packageA = await this.getPackage(packageIdA, storeId, instance);
        if (!packageA) return Either.error("PACKAGE_NOT_FOUND");

        const contentsA = packageA.contents;
        let contentsB: MetadataPackage;

        if (packageIdB) {
            const packageB = await this.getPackage(packageIdB, storeId, instance);
            if (!packageB) return Either.error("PACKAGE_NOT_FOUND");
            contentsB = packageB.contents;
        } else {
            // No package B specified, use local contents
            const moduleDataA = await this.storageRepository(instance).getObjectInCollection<
                BaseModule
            >(Namespace.MODULES, packageA.module.id);

            if (!moduleDataA) return Either.error("MODULE_NOT_FOUND");
            const moduleA = MetadataModule.build(moduleDataA);

            contentsB = await this.compositionRoot.sync[moduleA.type]({
                ...moduleA.toSyncBuilder(),
                originInstance: "LOCAL",
                targetInstances: [],
            }).buildPayload();
        }

        return Either.success(getMetadataPackageDiff(contentsB, contentsA));
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
