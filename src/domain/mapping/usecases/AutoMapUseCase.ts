import _ from "lodash";
import {
    cleanNestedMappedId,
    EXCLUDED_KEY,
} from "../../../presentation/react/components/mapping-table/utils";
import { UseCase } from "../../common/entities/UseCase";
import { DataSource } from "../../instance/entities/DataSource";
import { MappingConfig } from "../entities/MappingConfig";
import { MetadataMappingDictionary } from "../entities/MetadataMapping";
import { GenericMappingUseCase } from "./GenericMappingUseCase";

export class AutoMapUseCase extends GenericMappingUseCase implements UseCase {
    public async execute(
        originInstance: DataSource,
        destinationInstance: DataSource,
        mapping: MetadataMappingDictionary,
        mappingType: string,
        ids: string[],
        isGlobalMapping = false
    ): Promise<AutoMapUseCaseResult> {
        const metadataResponse = await this.getMetadata(originInstance, ids);
        const elements = this.createMetadataArray(metadataResponse);

        const tasks: MappingConfig[] = [];
        const errors: string[] = [];

        for (const item of elements) {
            const filter = await this.buildDataElementFilterForProgram(
                destinationInstance,
                item.id,
                mapping
            );

            const candidates = await this.autoMap({
                originInstance,
                destinationInstance,
                selectedItemId: item.id,
                filter,
            });
            const { mappedId } = _.first(candidates) ?? {};

            if (!mappedId) {
                errors.push(cleanNestedMappedId(item.id));
            } else {
                tasks.push({
                    selection: [item.id],
                    mappingType,
                    global: isGlobalMapping,
                    mappedId,
                });
            }
        }

        return { tasks, errors };
    }

    private async buildDataElementFilterForProgram(
        destinationInstance: DataSource,
        nestedId: string,
        mapping: MetadataMappingDictionary
    ): Promise<string[] | undefined> {
        const validIds = await this.getValidMappingIds(destinationInstance, nestedId);
        const originProgramId = nestedId.split("-")[0];
        const { mappedId } = _.get(mapping, ["eventPrograms", originProgramId]) ?? {};

        if (!mappedId || mappedId === EXCLUDED_KEY) return undefined;
        return [...validIds, mappedId];
    }
}

interface AutoMapUseCaseResult {
    tasks: MappingConfig[];
    errors: string[];
}
