import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { TransformationRepositoryConstructor } from "../../transformations/repositories/TransformationRepository";
import {
    ListMetadataParams,
    MetadataRepository,
    MetadataRepositoryConstructor,
} from "../repositories/MetadataRepository";

export class ListAllMetadataUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(params: ListMetadataParams, instance?: Instance) {
        return this.getMetadataRepository(instance).listAllMetadata(params);
    }

    private getMetadataRepository(remoteInstance = this.localInstance): MetadataRepository {
        const transformationRepository = this.repositoryFactory.get<
            TransformationRepositoryConstructor
        >(Repositories.TransformationRepository, []);

        return this.repositoryFactory.get<MetadataRepositoryConstructor>(
            Repositories.MetadataRepository,
            [remoteInstance, transformationRepository]
        );
    }
}
