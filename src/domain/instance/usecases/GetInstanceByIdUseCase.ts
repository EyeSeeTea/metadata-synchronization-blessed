import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance, InstanceData } from "../entities/Instance";

export class GetInstanceByIdUseCase extends DefaultUseCase implements UseCase {
    constructor(
        repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {
        super(repositoryFactory);
    }

    public async execute(id: string): Promise<Either<"NOT_FOUND", Instance>> {
        if (id === "LOCAL") return Either.success(this.localInstance);

        const data = await this.storageRepository(this.localInstance).getObjectInCollection<
            InstanceData
        >(Namespace.INSTANCES, id);

        if (!data) return Either.error("NOT_FOUND");

        return Either.success(Instance.build(data).decryptPassword(this.encryptionKey));
    }
}
