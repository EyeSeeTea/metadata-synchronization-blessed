import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { BasePackage } from "../entities/Package";
import { validatePackageContents, ValidationPackageResult } from "../validator/packageContentValidator";

export class ValidatePackageContentsUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string, instance = this.localInstance): Promise<ValidationPackageResult> {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClientPromise();

        const data = await storageClient.getObjectInCollection<BasePackage>(Namespace.PACKAGES, id);

        if (data) return validatePackageContents(data?.contents);
        else return Either.error({ errors: ["Package not found"], warnings: [] });
    }
}
