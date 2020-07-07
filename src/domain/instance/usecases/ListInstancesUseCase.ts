import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Instance, InstanceData } from "../entities/Instance";
import _ from "lodash";

export interface ListInstancesUseCaseProps {
    search?: string;
}

export class ListInstancesUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository, private encryptionKey: string) {}

    public async execute({ search }: ListInstancesUseCaseProps = {}): Promise<Instance[]> {
        const objects = await this.storageRepository.listObjectsInCollection<InstanceData>(
            Namespace.INSTANCES
        );

        const filteredData = search
            ? _.filter(objects, o =>
                  _(o)
                      .values()
                      .some(value =>
                          typeof value === "string"
                              ? value.toLowerCase().includes(search.toLowerCase())
                              : false
                      )
              )
            : objects;

        return filteredData.map(data => {
            return Instance.build(data).decryptPassword(this.encryptionKey);
        });
    }
}
