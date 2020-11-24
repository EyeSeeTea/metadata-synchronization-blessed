import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { BasePackage, Package } from "../entities/Package";

export class GetPackageUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(
        id: string,
        instance = this.localInstance
    ): Promise<Either<"NOT_FOUND", Package>> {
        const data = await this.storageRepository(instance).getObjectInCollection<BasePackage>(
            Namespace.PACKAGES,
            id
        );

        if (data) return Either.success(Package.build(data));
        else return Either.error("NOT_FOUND");
    }
}
