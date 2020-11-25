import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { ImportedPackage } from "../entities/ImportedPackage";

type SavePackageError = "UNEXPECTED_ERROR";

export class SaveImportedPackagesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        importedPackages: ImportedPackage[]
    ): Promise<Either<SavePackageError, void>> {
        try {
            await this.repositoryFactory
                .storageRepository(this.localInstance)
                .saveObjectsInCollection(Namespace.IMPORTEDPACKAGES, importedPackages);

            return Either.success(undefined);
        } catch (error) {
            console.error({ error });
            return Either.error("UNEXPECTED_ERROR");
        }
    }
}
