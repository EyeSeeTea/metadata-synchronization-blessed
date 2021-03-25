import _ from "lodash";
import { MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { MetadataRepository } from "../../metadata/repositories/MetadataRepository";
import { ProgramRef } from "./Models";
import { TEIsPayloadMapper } from "./TEIsPayloadMapper";

export default async function createTEIsPayloadMapper(
    metadataRepository: MetadataRepository,
    mapping: MetadataMappingDictionary
) {
    const destinationMappingPrograms = await getTrackerDestinationMappingPrograms(
        metadataRepository,
        mapping
    );

    return new TEIsPayloadMapper(mapping, destinationMappingPrograms);
}

async function getTrackerDestinationMappingPrograms(
    metadataRepository: MetadataRepository,
    mapping: MetadataMappingDictionary
): Promise<ProgramRef[]> {
    const trackerProgramsMapping = mapping["trackerPrograms"];
    if (trackerProgramsMapping) {
        const destinationMappingProgramsIds = _.compact(
            Object.values(trackerProgramsMapping).map(mapping => mapping.mappedId)
        );

        if (destinationMappingProgramsIds.length > 0) {
            const programs = (
                await metadataRepository.getMetadataByIds<ProgramRef>(
                    destinationMappingProgramsIds,
                    "id,programType"
                )
            ).programs;
            return programs ?? [];
        } else {
            return [];
        }
    } else {
        return [];
    }
}
