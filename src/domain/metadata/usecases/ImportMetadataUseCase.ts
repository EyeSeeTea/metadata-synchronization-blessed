import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { MetadataPackage } from "../entities/MetadataEntities";

export class ImportMetadataUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(payload: MetadataPackage, instance = this.localInstance): Promise<SynchronizationResult> {
        return this.repositoryFactory.metadataRepository(instance).save(payload);
    }
}
