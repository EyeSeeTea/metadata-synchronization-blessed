import _ from "lodash";
import { cleanNestedMappedId, EXCLUDED_KEY } from "../../../presentation/react/core/components/mapping-table/utils";
import { UseCase } from "../../common/entities/UseCase";
import { DataSource } from "../../instance/entities/DataSource";
import { cleanOrgUnitPath } from "../../synchronization/utils";
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
        const cleanIds = ids.map(id => cleanNestedMappedId(cleanOrgUnitPath(id)));
        const metadataResponse = await this.getMetadata(originInstance, cleanIds);
        const elements = this.createMetadataArray(metadataResponse);

        const tasks: MappingConfig[] = [];
        const errors: string[] = [];

        for (const id of ids) {
            const item = elements.find(item => item.id === cleanNestedMappedId(cleanOrgUnitPath(id)));

            // Special scenario: indicators look-up the id from a property
            const itemId = item?.aggregateExportCategoryOptionCombo
                ? _.first(item?.aggregateExportCategoryOptionCombo?.split("."))
                : item?.id;

            const filter = await this.buildDataElementFilterForProgram(destinationInstance, id, mapping);

            const candidates = await this.autoMap({
                destinationInstance,
                filter,
                selectedItem: {
                    id: itemId ?? id,
                    name: item?.name ?? "",
                    code: item?.code,
                    aggregateExportCategoryOptionCombo:
                        _.first(item?.aggregateExportCategoryOptionCombo?.split(".")) ??
                        item?.aggregateExportCategoryOptionCombo,
                },
            });
            const { mappedId } = _.first(candidates) ?? {};

            if (!mappedId) {
                errors.push(cleanNestedMappedId(id));
            } else {
                tasks.push({
                    selection: [id],
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
        const originProgramId = nestedId.split("-")[0];
        const { mappedId } = _.get(mapping, ["eventPrograms", originProgramId]) ?? {};
        if (!mappedId || mappedId === EXCLUDED_KEY) return undefined;

        const validIds = await this.getValidMappingIds(destinationInstance, mappedId);
        return [...validIds, mappedId];
    }
}

interface AutoMapUseCaseResult {
    tasks: MappingConfig[];
    errors: string[];
}
