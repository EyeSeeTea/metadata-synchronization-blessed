import { Id } from "../../common/entities/Schemas";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { DataSource } from "../../instance/entities/DataSource";
import { Instance } from "../../instance/entities/Instance";
import { MetadataEntity, MetadataPackage } from "../entities/MetadataEntities";

export class GetMetadataByIdsUseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(
        ids: Id[],
        instance?: DataSource,
        fields?: object | string,
        includeDefaults?: boolean
    ): Promise<MetadataPackage<MetadataEntity>> {
        return this.repositoryFactory
            .metadataRepository(instance ?? this.localInstance)
            .getMetadataByIds(ids, fields, includeDefaults);
    }
}
