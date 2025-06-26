import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { ImportedPackageData } from "../entities/ImportedPackage";

type ListImportedPackageError = "UNEXPECTED_ERROR";

export class ListImportedPackagesUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(): Promise<Either<ListImportedPackageError, ImportedPackageData[]>> {
        const storageClient = await this.repositoryFactory
            .configRepository(this.localInstance)
            .getStorageClientPromise();

        try {
            const items = await storageClient.listObjectsInCollection<ImportedPackageData>(Namespace.IMPORTEDPACKAGES);

            return Either.success(items);
        } catch (error: any) {
            return Either.error("UNEXPECTED_ERROR");
        }
    }
}
