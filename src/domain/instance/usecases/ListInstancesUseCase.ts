import _ from "lodash";
import { Namespace } from "../../../data/storage/Namespaces";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance, InstanceData } from "../entities/Instance";

export interface ListInstancesUseCaseProps {
    search?: string;
}

export class ListInstancesUseCase extends DefaultUseCase implements UseCase {
    constructor(
        repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {
        super(repositoryFactory);
    }

    public async execute({ search }: ListInstancesUseCaseProps = {}): Promise<Instance[]> {
        const objects = await this.storageRepository(this.localInstance).listObjectsInCollection<
            InstanceData
        >(Namespace.INSTANCES);

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
