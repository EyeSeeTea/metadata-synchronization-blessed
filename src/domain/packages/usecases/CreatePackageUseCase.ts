import { metadataTransformations } from "../../../data/transformations/PackageTransformations";
import { CompositionRoot } from "../../../presentation/CompositionRoot";
import { cache } from "../../../utils/cache";
import { getMajorVersion } from "../../../utils/d2-utils";
import { UseCase } from "../../common/entities/UseCase";
import { ValidationError } from "../../common/entities/Validations";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { Module } from "../../modules/entities/Module";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { TransformationRepositoryConstructor } from "../../transformations/repositories/TransformationRepository";
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
        const transformationRepository = this.getTransformationRepository();

        const basePayload = contents
            ? contents
            : await this.compositionRoot.sync[module.type]({
                  ...module.toSyncBuilder(),
                  originInstance,
                  targetInstances: [],
              }).buildPayload();

        const versionedPayload = transformationRepository.mapPackageTo(
            apiVersion,
            basePayload,
            metadataTransformations
        );

        const payload = sourcePackage.update({ contents: versionedPayload, dhisVersion });

        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );

        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [this.localInstance, ""]
        );

        const validations = payload.validate();

        if (validations.length === 0) {
            const user = await instanceRepository.getUser();
            const newPackage = payload.update({
                lastUpdated: new Date(),
                lastUpdatedBy: user,
                user: payload.user.id ? payload.user : user,
            });

            await storageRepository.saveObjectInCollection(Namespace.PACKAGES, newPackage);

            const newModule = module.update({ lastPackageVersion: newPackage.version });
            await storageRepository.saveObjectInCollection(Namespace.MODULES, newModule);
        }

        return validations;
    }

    @cache()
    protected getTransformationRepository() {
        return this.repositoryFactory.get<TransformationRepositoryConstructor>(
            Repositories.TransformationRepository,
            []
        );
    }
}
