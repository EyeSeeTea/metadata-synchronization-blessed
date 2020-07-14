import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { MetadataResponsible } from "../entities/MetadataResponsible";
import { Either } from "../../common/entities/Either";

export class GetResponsibleUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        id: string,
        instance = this.localInstance
    ): Promise<Either<"NOT_FOUND", MetadataResponsible>> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        const item = await storageRepository.getObjectInCollection<MetadataResponsible>(
            Namespace.RESPONSIBLES,
            id
        );

        if (!item) return Either.error("NOT_FOUND");
        else return Either.success(item);
    }
}
