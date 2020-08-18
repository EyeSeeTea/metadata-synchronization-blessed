import { BaseModule } from "./../../modules/entities/Module";
import { BasePackage } from "./../entities/Package";
import { MetadataModule } from "./../../modules/entities/MetadataModule";
import { CompositionRoot } from "./../../../presentation/CompositionRoot";
import { Either } from "./../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { MetadataPackageDiff, getMetadataPackageDiff } from "../entities/MetadataPackageDiff";

type DiffPackageUseCaseError = "PACKAGE_NOT_FOUND" | "MODULE_NOT_FOUND" | "NETWORK_ERROR";

export class DiffPackageUseCase implements UseCase {
    constructor(
        private compositionRoot: CompositionRoot,
        private repositoryFactory: RepositoryFactory
    ) {}

    public async execute(
        packageId: string,
        remoteInstance: Instance
    ): Promise<Either<DiffPackageUseCaseError, MetadataPackageDiff>> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [remoteInstance]
        );

        const remotePackage = await storageRepository.getObjectInCollection<BasePackage>(
            Namespace.PACKAGES,
            packageId
        );

        if (!remotePackage) return Either.error("PACKAGE_NOT_FOUND");

        const remoteModule = await storageRepository.getObjectInCollection<BaseModule>(
            Namespace.MODULES,
            remotePackage.module.id
        );

        if (!remoteModule) return Either.error("MODULE_NOT_FOUND");

        const moduleC = MetadataModule.build(remoteModule);
        const localContents = await this.compositionRoot.sync[moduleC.type]({
            ...moduleC.toSyncBuilder(),
            originInstance: "LOCAL",
            targetInstances: [],
        }).buildPayload();

        return Either.success(getMetadataPackageDiff(localContents, remotePackage.contents));
    }
}
