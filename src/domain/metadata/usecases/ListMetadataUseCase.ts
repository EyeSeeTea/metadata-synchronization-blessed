import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { DataSource } from "../../instance/entities/DataSource";
import { Instance } from "../../instance/entities/Instance";
import { ListMetadataParams, ListMetadataResponse } from "../repositories/MetadataRepository";

export class ListMetadataUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(
        params: ListMetadataParams,
        instance: DataSource = this.localInstance
    ): Promise<ListMetadataResponse> {
        return this.repositoryFactory.metadataRepository(instance).listMetadata(params);
    }
}
