import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { SynchronizationResult } from "../../synchronization/entities/SynchronizationResult";
import { TransformationRepositoryConstructor } from "../../transformations/repositories/TransformationRepository";
import { MetadataPackage } from "../entities/MetadataEntities";
import {
    MetadataRepository,
    MetadataRepositoryConstructor,
} from "../repositories/MetadataRepository";

export class ImportMetadataUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        payload: MetadataPackage,
        instance?: Instance
    ): Promise<SynchronizationResult> {
        return this.getMetadataRepository(instance).save(payload);
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
