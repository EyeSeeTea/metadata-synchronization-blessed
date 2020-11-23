import _ from "lodash";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../../data/storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageClient";
import { Instance, InstanceData } from "../entities/Instance";

export interface ListInstancesUseCaseProps {
    search?: string;
}

export class ListInstancesUseCase implements UseCase {
    constructor(
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {}

    public async execute({ search }: ListInstancesUseCaseProps = {}): Promise<Instance[]> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );

        const objects = await storageRepository.listObjectsInCollection<InstanceData>(
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
