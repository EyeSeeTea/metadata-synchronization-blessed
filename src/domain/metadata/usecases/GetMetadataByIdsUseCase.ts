import { Id } from "../../common/entities/Schemas";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataEntity, MetadataPackage } from "../entities/MetadataEntities";

export class GetMetadataByIdsUseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        ids: Id[],
        fields?: object | string,
        includeDefaults?: boolean
    ): Promise<MetadataPackage<MetadataEntity>> {
        return this.repositoryFactory
            .metadataRepository(this.localInstance)
            .getMetadataByIds(ids, fields, includeDefaults);
    }
}
