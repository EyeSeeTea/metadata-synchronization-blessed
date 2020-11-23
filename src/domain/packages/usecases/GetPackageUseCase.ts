import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageClient";
import { BasePackage, Package } from "../entities/Package";

export class GetPackageUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        id: string,
        instance = this.localInstance
    ): Promise<Either<"NOT_FOUND", Package>> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        const data = await storageRepository.getObjectInCollection<BasePackage>(
            Namespace.PACKAGES,
            id
        );

        if (data) return Either.success(Package.build(data));
        else return Either.error("NOT_FOUND");
    }
}
