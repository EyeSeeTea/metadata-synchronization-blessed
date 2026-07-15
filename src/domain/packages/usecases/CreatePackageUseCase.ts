import { Namespace } from "../../../data/storage/Namespaces";
import { metadataTransformations } from "../../../data/transformations/PackageTransformations";
import { getMajorVersion } from "../../../utils/d2-utils";
import { UseCase } from "../../common/entities/UseCase";
import { ValidationError } from "../../common/entities/Validations";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPayloadBuilder } from "../../metadata/builders/MetadataPayloadBuilder";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { Module } from "../../modules/entities/Module";
import { TransformationRepository } from "../../transformations/repositories/TransformationRepository";
import { UserRepository } from "../../user/repositories/UserRepository";
import { Package } from "../entities/Package";

export class CreatePackageUseCase implements UseCase {
    constructor(
        private metadataPayloadBuilder: MetadataPayloadBuilder,
        private repositoryFactory: DynamicRepositoryFactory,
        private transformationRepository: TransformationRepository,
        private userRepository: UserRepository,
        private localInstance: Instance
    ) {}

    public async execute(
        originInstance: string,
        sourcePackage: Package,
        module: Module,
        dhisVersion: string,
        contents?: MetadataPackage
    ): Promise<ValidationError[]> {
        const storageClient = await this.repositoryFactory
            .configRepository(this.localInstance)
            .getStorageClientPromise();

        const apiVersion = getMajorVersion(dhisVersion);

        const syncBuilder = {
            ...module.toSyncBuilder(),
            originInstance,
            targetInstances: [],
        };

        const basePayload = contents ? contents : this.metadataPayloadBuilder.build(syncBuilder);

        const versionedPayload = this.transformationRepository.mapPackageTo(
            apiVersion,
            basePayload,
            metadataTransformations
        );

        const payload = sourcePackage.update({ contents: versionedPayload, dhisVersion });

        const validations = payload.validate();

        if (validations.length === 0) {
            const user = await this.userRepository.getCurrent();
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
