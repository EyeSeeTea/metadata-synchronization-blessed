import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { DataSource } from "../../instance/entities/DataSource";
import { Instance } from "../../instance/entities/Instance";
import { MetadataEntity } from "../entities/MetadataEntities";
import { ListMetadataParams } from "../repositories/MetadataRepository";

export class ListAllMetadataUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(
        params: ListMetadataParams,
        instance: DataSource = this.localInstance
    ): Promise<MetadataEntity[]> {
        return this.metadataRepository(instance).listAllMetadata(params);
    }
}
