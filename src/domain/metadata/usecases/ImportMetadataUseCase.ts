import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationResult } from "../../synchronization/entities/SynchronizationResult";
import { MetadataPackage } from "../entities/MetadataEntities";

export class ImportMetadataUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(
        payload: MetadataPackage,
        instance = this.localInstance
    ): Promise<SynchronizationResult> {
        return this.metadataRepository(instance).save(payload);
    }
}
