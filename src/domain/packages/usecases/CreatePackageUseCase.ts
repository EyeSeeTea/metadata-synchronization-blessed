import { generateUid } from "d2/uid";
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
            const user = await this.repositoryFactory
                .instanceRepository(this.localInstance)
                .getUser();
            const newPackage = payload.update({
                id: generateUid(),
                lastUpdated: new Date(),
                lastUpdatedBy: user,
                user: payload.user.id ? payload.user : user,
            });

            await this.repositoryFactory
                .storageRepository(this.localInstance)
                .saveObjectInCollection(Namespace.PACKAGES, newPackage);

            const newModule = module.update({ lastPackageVersion: newPackage.version });
            await this.repositoryFactory
                .storageRepository(this.localInstance)
                .saveObjectInCollection(Namespace.MODULES, newModule);
        }

        return validations;
    }
}
