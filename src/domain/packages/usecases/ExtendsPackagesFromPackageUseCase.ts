import { generateUid } from "d2/uid";
import { Namespace } from "../../../data/storage/Namespaces";
import { metadataTransformations } from "../../../data/transformations/PackageTransformations";
import { getMajorVersion } from "../../../utils/d2-utils";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { TransformationRepository } from "../../transformations/repositories/TransformationRepository";
import { UserRepository } from "../../user/repositories/UserRepository";
import { BasePackage, Package } from "../entities/Package";

export class ExtendsPackagesFromPackageUseCase implements UseCase {
    constructor(
        private repositoryFactory: DynamicRepositoryFactory,
        private transformationRepository: TransformationRepository,
        private userRepository: UserRepository,
        private localInstance: Instance
    ) {}

    public async execute(packageSourceId: string, dhisVersions: string[]): Promise<void> {
        const storageClient = await this.repositoryFactory
            .configRepository(this.localInstance)
            .getStorageClientPromise();

        const packageData = await storageClient.getObjectInCollection<BasePackage>(Namespace.PACKAGES, packageSourceId);

        const pkg = Package.build(packageData);

        const user = await this.userRepository.getCurrent();

        for (const dhisVersion of dhisVersions) {
            const originApiVersion = getMajorVersion(pkg.dhisVersion);
            const destinationApiVersion = getMajorVersion(dhisVersion);

            const versionedPayload =
                destinationApiVersion > originApiVersion
                    ? this.transformationRepository.mapPackageTo(
                          destinationApiVersion,
                          pkg.contents,
                          metadataTransformations,
                          originApiVersion
                      )
                    : this.transformationRepository.mapPackageFrom(
                          originApiVersion,
                          pkg.contents,
                          metadataTransformations,
                          destinationApiVersion
                      );

            const newPackage = pkg.update({
                id: generateUid(),
                dhisVersion,
                created: new Date(),
                lastUpdated: new Date(),
                lastUpdatedBy: user,
                user: user,
                contents: versionedPayload,
            });

            await storageClient.saveObjectInCollection(Namespace.PACKAGES, newPackage);
        }
    }
}
