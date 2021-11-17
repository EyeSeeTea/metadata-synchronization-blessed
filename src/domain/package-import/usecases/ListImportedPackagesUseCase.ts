import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { ImportedPackageData } from "../entities/ImportedPackage";

type ListImportedPackageError = "UNEXPECTED_ERROR";

export class ListImportedPackagesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(): Promise<Either<ListImportedPackageError, ImportedPackageData[]>> {
        const storageClient = await this.repositoryFactory.configRepository(this.localInstance).getStorageClient();

        try {
            const items = await storageClient.listObjectsInCollection<ImportedPackageData>(Namespace.IMPORTEDPACKAGES);

            return Either.success(items);
        } catch (error: any) {
            return Either.error("UNEXPECTED_ERROR");
        }
    }
}
