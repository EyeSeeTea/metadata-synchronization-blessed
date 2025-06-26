import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { BasePackage, Package } from "../entities/Package";

export class GetPackageUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string, instance = this.localInstance): Promise<Either<"NOT_FOUND", Package>> {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClientPromise();

        const data = await storageClient.getObjectInCollection<BasePackage>(Namespace.PACKAGES, id);

        if (data) return Either.success(Package.build(data));
        else return Either.error("NOT_FOUND");
    }
}
