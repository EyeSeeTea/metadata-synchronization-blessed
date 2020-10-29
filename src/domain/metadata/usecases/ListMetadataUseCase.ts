import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { DataSource } from "../../instance/entities/DataSource";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { TransformationRepositoryConstructor } from "../../transformations/repositories/TransformationRepository";
import {
    ListMetadataParams,
    ListMetadataResponse,
    MetadataRepository,
    MetadataRepositoryConstructor,
} from "../repositories/MetadataRepository";

export class ListMetadataUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        params: ListMetadataParams,
        instance?: DataSource
    ): Promise<ListMetadataResponse> {
        return this.getMetadataRepository(instance).listMetadata(params);
    }

    private getMetadataRepository(
        remoteInstance: DataSource = this.localInstance
    ): MetadataRepository {
        const transformationRepository = this.repositoryFactory.get<
            TransformationRepositoryConstructor
        >(Repositories.TransformationRepository, []);

        const tag = remoteInstance.type === "json" ? "json" : undefined;

        return this.repositoryFactory.get<MetadataRepositoryConstructor>(
            Repositories.MetadataRepository,
            [remoteInstance, transformationRepository],
            tag
        );
    }
}
