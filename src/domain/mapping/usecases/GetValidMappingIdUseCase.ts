import _ from "lodash";
import { cleanNestedMappedId } from "../../../presentation/react/components/mapping-table/utils";
import { UseCase } from "../../common/entities/UseCase";
import { DataSource } from "../../instance/entities/DataSource";
import { GenericMappingUseCase } from "./GenericMappingUseCase";

export class GetValidMappingIdUseCase extends GenericMappingUseCase implements UseCase {
    public async execute(originInstance: DataSource, id: string): Promise<string[]> {
        const metadataResponse = await this.getMetadata(originInstance, [id]);
        const metadata = this.createMetadataArray(metadataResponse);
        if (metadata.length === 0) return [];

        const categoryOptions = this.getCategoryOptions(metadata[0]);
        const options = this.getOptions(metadata[0]);
        const programStages = this.getProgramStages(metadata[0]);
        const programStageDataElements = this.getProgramStageDataElements(metadata[0]);

        const defaultValues = await this.getMetadataRepository(originInstance).getDefaultIds();

        return _.union(categoryOptions, options, programStages, programStageDataElements)
            .map(({ id }) => id)
            .concat(...defaultValues)
            .map(cleanNestedMappedId);
    }
}
