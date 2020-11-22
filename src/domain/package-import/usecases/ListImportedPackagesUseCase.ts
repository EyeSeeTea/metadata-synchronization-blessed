import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { ImportedPackageData } from "../entities/ImportedPackage";

type ListImportedPackageError = "UNEXPECTED_ERROR";

export class ListImportedPackagesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(): Promise<Either<ListImportedPackageError, ImportedPackageData[]>> {
        try {
            const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
                Repositories.StorageRepository,
                [this.localInstance]
            );

            const items = await storageRepository.listObjectsInCollection<ImportedPackageData>(
                Namespace.IMPORTEDPACKAGES
            );

            return Either.success(items);
        } catch (error) {
            return Either.error("UNEXPECTED_ERROR");
        }
    }
}
