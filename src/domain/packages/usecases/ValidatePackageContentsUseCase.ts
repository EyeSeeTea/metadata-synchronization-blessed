import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { BasePackage } from "../entities/Package";
import { validatePackageContents } from "../validator/packageContentValidator";

export class ValidatePackageContentsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string, instance = this.localInstance): Promise<Either<string[], void>> {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClient();

        const data = await storageClient.getObjectInCollection<BasePackage>(Namespace.PACKAGES, id);

        if (data) return validatePackageContents(data?.contents);
        else return Either.error(["Package not found"]);
    }
}
