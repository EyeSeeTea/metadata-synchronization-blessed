import { generateUid } from "d2/uid";
import { Namespace } from "../../../data/storage/Namespaces";
import { metadataTransformations } from "../../../data/transformations/PackageTransformations";
import { getMajorVersion } from "../../../utils/d2-utils";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { BasePackage, Package } from "../entities/Package";

export class ExtendsPackagesFromPackageUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(packageSourceId: string, dhisVersions: string[]): Promise<void> {
        const storageClient = await this.repositoryFactory
            .configRepository(this.localInstance)
            .getStorageClientPromise();
        const transformationRepository = this.repositoryFactory.transformationRepository();

        const packageData = await storageClient.getObjectInCollection<BasePackage>(Namespace.PACKAGES, packageSourceId);

        const pkg = Package.build(packageData);

        const user = await this.repositoryFactory.userRepository(this.localInstance).getCurrent();

        for (const dhisVersion of dhisVersions) {
            const originApiVersion = getMajorVersion(pkg.dhisVersion);
            const destinationApiVersion = getMajorVersion(dhisVersion);

            const versionedPayload =
                destinationApiVersion > originApiVersion
                    ? transformationRepository.mapPackageTo(
                          destinationApiVersion,
                          pkg.contents,
                          metadataTransformations,
                          originApiVersion
                      )
                    : transformationRepository.mapPackageFrom(
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
