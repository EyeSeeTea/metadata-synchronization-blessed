import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance, InstanceData } from "../entities/Instance";

export class GetInstanceByIdUseCase implements UseCase {
    constructor(
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {}

    public async execute(id: string): Promise<Either<"NOT_FOUND", Instance>> {
        const data = await this.repositoryFactory
            .storageRepository(this.localInstance)
            .getObjectInCollection<InstanceData>(Namespace.INSTANCES, id);

        if (!data) return Either.error("NOT_FOUND");

        const instance = Instance.build({
            ...data,
            url: data.type === "local" ? this.localInstance.url : data.url,
            version: data.type === "local" ? this.localInstance.version : data.version,
        }).decryptPassword(this.encryptionKey);

        return Either.success(instance);
    }
}
