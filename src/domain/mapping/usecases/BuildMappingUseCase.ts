import { UseCase } from "../../common/entities/UseCase";
import { DataSource } from "../../instance/entities/DataSource";
import { MetadataMapping } from "../entities/MetadataMapping";
import { GenericMappingUseCase } from "./GenericMappingUseCase";

export class BuildMappingUseCase extends GenericMappingUseCase implements UseCase {
    public async execute(params: {
        originInstance: DataSource;
        destinationInstance: DataSource;
        originalId: string;
        mappedId?: string;
    }): Promise<MetadataMapping> {
        const metadataResponse = await this.getMetadata(params.originInstance, [params.originalId]);
        const metadata = this.createMetadataDictionary(metadataResponse);

        return this.buildMapping({ ...params, metadata });
    }
}
