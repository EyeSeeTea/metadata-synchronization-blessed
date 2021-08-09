import _ from "lodash";
import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataResponsible } from "../entities/MetadataResponsible";

export class ListResponsiblesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(instance = this.localInstance): Promise<MetadataResponsible[]> {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClient();

        const items = await storageClient.listObjectsInCollection<MetadataResponsible>(Namespace.RESPONSIBLES);

        const names = await this.getDisplayNames(
            instance,
            items.map(({ id }) => id)
        );

        return items.map(item => ({ ...item, name: names[item.id] }));
    }

    private async getDisplayNames(instance: Instance, ids: string[]) {
        const metadata = await this.repositoryFactory.metadataRepository(instance).getMetadataByIds<{
            id: string;
            displayName: string;
        }>(ids, "id,displayName");

        return _(metadata)
            .values()
            .compact()
            .flatMap(arr => arr.map(({ id, displayName }) => [id, displayName]))
            .fromPairs()
            .value();
    }
}
