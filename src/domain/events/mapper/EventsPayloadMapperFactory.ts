import _ from "lodash";
import { MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { MetadataRepository } from "../../metadata/repositories/MetadataRepository";
import { EventsPayloadMapper } from "./EventsPayloadMapper";
import { ProgramStageRef } from "./Models";

export async function createEventsPayloadMapper(
    metadataRepository: MetadataRepository,
    remoteMetadataRepository: MetadataRepository,
    mapping: MetadataMappingDictionary
) {
    const originCategoryOptionCombos = await metadataRepository.getCategoryOptionCombos();
    const destinationCategoryOptionCombos = await remoteMetadataRepository.getCategoryOptionCombos();
    const defaultCategoryOptionCombos = await metadataRepository.getDefaultIds("categoryOptionCombos");

    const { trackerProgramStages = {} } = mapping;

    const mappedProgramStages = _(trackerProgramStages)
        .values()
        .value()
        .filter(mapping => mapping.mappedId !== undefined)
        .map(mapping => mapping.mappedId) as string[];

    const mappedTrackedProgramStages = await getMappedTrackedProgramStages(
        remoteMetadataRepository,
        mappedProgramStages
    );

    return new EventsPayloadMapper(
        mapping,
        originCategoryOptionCombos,
        destinationCategoryOptionCombos,
        defaultCategoryOptionCombos[0],
        mappedTrackedProgramStages
    );
}

async function getMappedTrackedProgramStages(
    remoteMetadataRepository: MetadataRepository,
    destinationProgramStages?: string[]
): Promise<ProgramStageRef[]> {
    if (destinationProgramStages && destinationProgramStages?.length > 0) {
        const result = await remoteMetadataRepository.getMetadataByIds<ProgramStageRef>(
            destinationProgramStages,
            "id, program"
        );

        return result.programStages ?? [];
    } else {
        return [];
    }
}
