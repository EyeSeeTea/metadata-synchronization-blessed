import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { DataSource } from "../../instance/entities/DataSource";
import { Instance } from "../../instance/entities/Instance";
import { ListMetadataParams, ListMetadataResponse } from "../repositories/MetadataRepository";

export class ListMetadataUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(
        params: ListMetadataParams,
        instance: DataSource = this.localInstance
    ): Promise<ListMetadataResponse> {
        return this.metadataRepository(instance).listMetadata(params);
    }
}
