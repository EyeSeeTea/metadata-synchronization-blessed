import { Namespace } from "../../../data/storage/Namespaces";
import { metadataTransformations } from "../../../data/transformations/PackageTransformations";
import { CompositionRoot } from "../../../presentation/CompositionRoot";
import { getMajorVersion } from "../../../utils/d2-utils";
import { UseCase } from "../../common/entities/UseCase";
import { ValidationError } from "../../common/entities/Validations";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { Module } from "../../modules/entities/Module";
import { Package } from "../entities/Package";

export class CreatePackageUseCase implements UseCase {
    constructor(
        private compositionRoot: CompositionRoot,
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance
    ) {}

    public async execute(
        originInstance: string,
        sourcePackage: Package,
        module: Module,
        dhisVersion: string,
        contents?: MetadataPackage
    ): Promise<ValidationError[]> {
        const storageClient = await this.repositoryFactory.configRepository(this.localInstance).getStorageClient();

        const apiVersion = getMajorVersion(dhisVersion);

        const basePayload = contents
            ? contents
            : await this.compositionRoot.sync[module.type]({
                  ...module.toSyncBuilder(),
                  originInstance,
                  targetInstances: [],
              }).buildPayload();

        const versionedPayload = this.repositoryFactory
            .transformationRepository()
            .mapPackageTo(apiVersion, basePayload, metadataTransformations);

        const payload = sourcePackage.update({ contents: versionedPayload, dhisVersion });

        const validations = payload.validate();

        if (validations.length === 0) {
            const user = await this.repositoryFactory.userRepository(this.localInstance).getCurrent();
            const newPackage = payload.update({
                lastUpdated: new Date(),
                lastUpdatedBy: user,
                user: payload.user.id ? payload.user : user,
            });

            await storageClient.saveObjectInCollection(Namespace.PACKAGES, newPackage);

            const newModule = module.update({ lastPackageVersion: newPackage.version });
            await storageClient.saveObjectInCollection(Namespace.MODULES, newModule);
        }

        return validations;
    }
}
