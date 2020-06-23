import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Instance, InstanceData } from "../entities/Instance";

export class ListInstancesUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository, private encryptionKey: string) {}

    public async execute(): Promise<Instance[]> {
        const objects = await this.storageRepository.listObjectsInCollection<InstanceData>(
            Namespace.INSTANCES
        );

        return objects.map(data => {
            return Instance.build(data).decryptPassword(this.encryptionKey);
        });
    }
}
