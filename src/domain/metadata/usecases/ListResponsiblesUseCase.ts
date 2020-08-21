import _ from "lodash";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { TransformationRepositoryConstructor } from "../../transformations/repositories/TransformationRepository";
import { MetadataResponsible } from "../entities/MetadataResponsible";
import { MetadataRepositoryConstructor } from "../repositories/MetadataRepository";

export class ListResponsiblesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(instance = this.localInstance): Promise<MetadataResponsible[]> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        const items = await storageRepository.listObjectsInCollection<MetadataResponsible>(
            Namespace.RESPONSIBLES
        );

        const names = await this.getDisplayNames(
            instance,
            items.map(({ id }) => id)
        );

        return items.map(item => ({ ...item, name: names[item.id] }));
    }

    private async getDisplayNames(instance: Instance, ids: string[]) {
        const transformationsRepository = this.repositoryFactory.get<
            TransformationRepositoryConstructor
        >(Repositories.TransformationRepository, []);

        const metadataRepository = this.repositoryFactory.get<MetadataRepositoryConstructor>(
            Repositories.MetadataRepository,
            [instance, transformationsRepository]
        );

        const metadata = await metadataRepository.getMetadataByIds<{
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
