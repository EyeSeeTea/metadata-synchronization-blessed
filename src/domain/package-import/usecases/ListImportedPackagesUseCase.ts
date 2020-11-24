import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { ImportedPackageData } from "../entities/ImportedPackage";

type ListImportedPackageError = "UNEXPECTED_ERROR";

export class ListImportedPackagesUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(): Promise<Either<ListImportedPackageError, ImportedPackageData[]>> {
        try {
            const items = await this.storageRepository(this.localInstance).listObjectsInCollection<
                ImportedPackageData
            >(Namespace.IMPORTEDPACKAGES);

            return Either.success(items);
        } catch (error) {
            return Either.error("UNEXPECTED_ERROR");
        }
    }
}
