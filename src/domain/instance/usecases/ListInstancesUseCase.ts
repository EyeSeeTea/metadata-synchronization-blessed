import _ from "lodash";
import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance, InstanceData } from "../entities/Instance";

export interface ListInstancesUseCaseProps {
    search?: string;
    ids?: string[];
}

export class ListInstancesUseCase implements UseCase {
    constructor(
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {}

    public async execute({ search, ids }: ListInstancesUseCaseProps = {}): Promise<Instance[]> {
        const storageClient = await this.repositoryFactory
            .configRepository(this.localInstance)
            .getStorageClient();

        const objects = await storageClient.listObjectsInCollection<InstanceData>(
            Namespace.INSTANCES
        );

        const filteredDataBySearch = search
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

        const filteredDataByIds = filteredDataBySearch.filter(
            instanceData => !ids || ids.includes(instanceData.id)
        );

        return filteredDataByIds.map(data =>
            Instance.build({
                ...data,
                url: data.type === "local" ? this.localInstance.url : data.url,
                version: data.type === "local" ? this.localInstance.version : data.version,
            }).decryptPassword(this.encryptionKey)
        );
    }
}
