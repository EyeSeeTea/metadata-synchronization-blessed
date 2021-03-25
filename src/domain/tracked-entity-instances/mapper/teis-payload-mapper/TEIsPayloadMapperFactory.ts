import _ from "lodash";
import { MetadataMappingDictionary } from "../../../mapping/entities/MetadataMapping";
import { MetadataRepository } from "../../../metadata/repositories/MetadataRepository";
import { TrackedEntityInstance } from "../../entities/TrackedEntityInstance";
import { ProgramRef } from "../Models";
import { TEIsPayloadMapper } from "./TEIsPayloadMapper";

export default async function createTEIsPayloadMapper(
    metadataRepository: MetadataRepository,
    teis: TrackedEntityInstance[],
    mapping: MetadataMappingDictionary
) {
    const destinationMappingPrograms = await getAllPossibleDestinationPrograms(
        metadataRepository,
        teis,
        mapping
    );

    return new TEIsPayloadMapper(mapping, destinationMappingPrograms);
}

async function getAllPossibleDestinationPrograms(
    metadataRepository: MetadataRepository,
    teis: TrackedEntityInstance[],
    mapping: MetadataMappingDictionary
): Promise<ProgramRef[]> {
    const trackerProgramsMapping = mapping["trackerPrograms"];

    const destinationProgramsByMapping = trackerProgramsMapping
        ? _.compact(Object.values(trackerProgramsMapping).map(mapping => mapping.mappedId))
        : [];

    const destinationProgramsByPayload = teis
        .map(tei => tei.programOwners.map(owner => owner.program))
        .flat();

    const allPossibleDestinationProgramIds = [
        ...destinationProgramsByMapping,
        ...destinationProgramsByPayload,
    ];

    if (allPossibleDestinationProgramIds.length > 0) {
        const programs = (
            await metadataRepository.getMetadataByIds<ProgramRef>(
                allPossibleDestinationProgramIds,
                "id,programType, programTrackedEntityAttributes[trackedEntityAttribute]"
            )
        ).programs;

        return programs ?? [];
    } else {
        return [];
    }
}
