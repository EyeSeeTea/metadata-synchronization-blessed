import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { ImportedPackage } from "../entities/ImportedPackage";

type SavePackageError = "UNEXPECTED_ERROR";

export class SaveImportedPackagesUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(importedPackages: ImportedPackage[]): Promise<Either<SavePackageError, void>> {
        const storageClient = await this.repositoryFactory
            .configRepository(this.localInstance)
            .getStorageClientPromise();

        try {
            await storageClient.saveObjectsInCollection(Namespace.IMPORTEDPACKAGES, importedPackages);

            return Either.success(undefined);
        } catch (error: any) {
            console.error({ error });
            return Either.error("UNEXPECTED_ERROR");
        }
    }
}
