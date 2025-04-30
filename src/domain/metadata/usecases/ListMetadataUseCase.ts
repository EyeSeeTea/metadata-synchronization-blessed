import { UseCase } from "../../common/entities/UseCase";
import { RepositoryByInstanceFactory } from "../../common/factories/RepositoryFactory";
import { DataSource } from "../../instance/entities/DataSource";
import { Instance } from "../../instance/entities/Instance";
import { ListMetadataParams, ListMetadataResponse } from "../repositories/MetadataRepository";

export class ListMetadataUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryByInstanceFactory, private localInstance: Instance) {}

    public async execute(
        params: ListMetadataParams,
        instance: DataSource = this.localInstance
    ): Promise<ListMetadataResponse> {
        return this.repositoryFactory.metadataRepository(instance).listMetadata(params);
    }
}
