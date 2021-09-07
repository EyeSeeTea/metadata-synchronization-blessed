import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { MetadataPackage } from "../entities/MetadataEntities";

export class ImportMetadataUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(payload: MetadataPackage, instance = this.localInstance): Promise<SynchronizationResult> {
        return this.repositoryFactory.metadataRepository(instance).save(payload);
    }
}
