import _ from "lodash";
import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
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
        const objects = await this.repositoryFactory
            .storageRepository(this.localInstance)
            .listObjectsInCollection<InstanceData>(Namespace.INSTANCES);

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

        return filteredData.map(data =>
            Instance.build({
                ...data,
                url: data.type === "local" ? this.localInstance.url : data.url,
            }).decryptPassword(this.encryptionKey)
        );
    }
}
