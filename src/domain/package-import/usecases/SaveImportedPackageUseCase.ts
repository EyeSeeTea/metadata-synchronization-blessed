import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { ImportedPackage } from "../entities/ImportedPackage";

type SavePackageError = "UNEXPECTED_ERROR";

export class SaveImportedPackageUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        importedPackage: ImportedPackage
    ): Promise<Either<SavePackageError, void>> {
        try {
            const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
                Repositories.StorageRepository,
                [this.localInstance]
            );

            await storageRepository.saveObjectInCollection(
                Namespace.IMPORTEDPACKAGES,
                importedPackage
            );

            return Either.success(undefined);
        } catch (error) {
            console.error({ error });
            return Either.error("UNEXPECTED_ERROR");
        }
    }
}
