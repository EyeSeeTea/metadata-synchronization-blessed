import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { DataSource } from "../../instance/entities/DataSource";
import { Instance } from "../../instance/entities/Instance";
import { MetadataEntity } from "../entities/MetadataEntities";
import { ListMetadataParams } from "../repositories/MetadataRepository";

export class ListAllMetadataUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        params: ListMetadataParams,
        instance: DataSource = this.localInstance
    ): Promise<MetadataEntity[]> {
        return this.repositoryFactory.metadataRepository(instance).listAllMetadata(params);
    }
}
