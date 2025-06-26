import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPayloadBuilder } from "../../metadata/builders/MetadataPayloadBuilder";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { getMetadataPackageDiff, MetadataPackageDiff } from "../entities/MetadataPackageDiff";
import { GitHubRepository } from "../repositories/GitHubRepository";
import { Either } from "./../../common/entities/Either";
import { MetadataModule } from "./../../modules/entities/MetadataModule";
import { BaseModule } from "./../../modules/entities/Module";
import { BasePackage } from "./../entities/Package";

type DiffPackageUseCaseError = "PACKAGE_NOT_FOUND" | "MODULE_NOT_FOUND" | "NETWORK_ERROR";

export class DiffPackageUseCase implements UseCase {
    constructor(
        private metadataPayloadBuilder: MetadataPayloadBuilder,
        private repositoryFactory: DynamicRepositoryFactory,
        private gitHubRepository: GitHubRepository,
        private localInstance: Instance
    ) {}

    public async execute(
        packageIdBase: string | undefined,
        packageIdMerge: string,
        storeId: string | undefined,
        instance = this.localInstance
    ): Promise<Either<DiffPackageUseCaseError, MetadataPackageDiff>> {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClientPromise();

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
            const moduleDataMerge = await storageClient.getObjectInCollection<BaseModule>(
                Namespace.MODULES,
                packageMerge.module.id
            );

            if (!moduleDataMerge) return Either.error("MODULE_NOT_FOUND");
            const moduleMerge = MetadataModule.build(moduleDataMerge);

            contentsBase = await this.metadataPayloadBuilder.build({
                ...moduleMerge.toSyncBuilder(),
                originInstance: "LOCAL",
                targetInstances: [],
            });
        }

        return Either.success(getMetadataPackageDiff(contentsBase, contentsMerge));
    }

    private async getPackage(
        packageId: string,
        storeId: string | undefined,
        instance: Instance
    ): Promise<BasePackage | undefined> {
        return storeId ? this.getStorePackage(storeId, packageId) : this.getDataStorePackage(packageId, instance);
    }

    private async getDataStorePackage(id: string, instance: Instance) {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClientPromise();

        return storageClient.getObjectInCollection<BasePackage>(Namespace.PACKAGES, id);
    }

    private async getStorePackage(storeId: string, url: string) {
        const store = await this.repositoryFactory.storeRepository(this.localInstance).getById(storeId);
        if (!store) return undefined;

        const { encoding, content } = await this.gitHubRepository.request<{
            encoding: string;
            content: string;
        }>(store, url);

        const validation = this.gitHubRepository.readFileContents<MetadataPackage & { package: BasePackage }>(
            encoding,
            content
        );

        if (!validation.value.data) return undefined;

        const { package: basePackage, ...contents } = validation.value.data;
        return { ...basePackage, contents };
    }
}
