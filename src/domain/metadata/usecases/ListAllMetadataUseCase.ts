import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { DataSource } from "../../instance/entities/DataSource";
import { Instance } from "../../instance/entities/Instance";
import { MetadataEntity } from "../entities/MetadataEntities";
import { ListMetadataParams } from "../repositories/MetadataRepository";

export class ListAllMetadataUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(
        params: ListMetadataParams,
        instance: DataSource = this.localInstance
    ): Promise<MetadataEntity[]> {
        return this.repositoryFactory.metadataRepository(instance).listAllMetadata(params);
    }
}
