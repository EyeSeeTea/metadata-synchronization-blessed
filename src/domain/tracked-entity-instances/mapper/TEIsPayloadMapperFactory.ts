import { generateUid } from "d2/uid";
import _ from "lodash";
import moment from "moment";
import { MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { MetadataRepository } from "../../metadata/repositories/MetadataRepository";
import { TrackedEntityInstance } from "../entities/TrackedEntityInstance";
import { ProgramRef } from "./Models";
import { TEIsPayloadMapper } from "./teis-payload-mapper/TEIsPayloadMapper";
import { TEIsToEventPayloadMapper } from "./teis-to-event-payload-mapper/TEIsToEventPayloadMapper";

export async function createTEIsPayloadMapper(
    metadataRepository: MetadataRepository,
    teis: TrackedEntityInstance[],
    mapping: MetadataMappingDictionary
) {
    const destinationMappingPrograms = await getAllPossibleDestinationPrograms(metadataRepository, mapping, teis);

    return new TEIsPayloadMapper(mapping, destinationMappingPrograms);
}

export async function createTEIsToEventPayloadMapper(
    metadataRepository: MetadataRepository,
    mapping: MetadataMappingDictionary
) {
    const destinationMappingPrograms = await getAllPossibleDestinationPrograms(metadataRepository, mapping);

    return new TEIsToEventPayloadMapper(
        mapping,
        destinationMappingPrograms,
        () => moment().toISOString(),
        () => generateUid()
    );
}

async function getAllPossibleDestinationPrograms(
    metadataRepository: MetadataRepository,
    mapping: MetadataMappingDictionary,
    teis: TrackedEntityInstance[] = []
): Promise<ProgramRef[]> {
    const trackerProgramsMapping = mapping["trackerPrograms"];

    const destinationProgramsByMapping = trackerProgramsMapping
        ? _.compact(Object.values(trackerProgramsMapping).map(mapping => mapping.mappedId))
        : [];

    const destinationProgramsByPayload = teis.map(tei => tei.programOwners.map(owner => owner.program)).flat();

    const allPossibleDestinationProgramIds = [...destinationProgramsByMapping, ...destinationProgramsByPayload];

    if (allPossibleDestinationProgramIds.length > 0) {
        const programs = (
            await metadataRepository.getMetadataByIds<ProgramRef>(
                allPossibleDestinationProgramIds,
                "id,programType, programTrackedEntityAttributes[trackedEntityAttribute],programStages[id,programStageDataElements[dataElement]]"
            )
        ).programs;

        return programs ?? [];
    } else {
        return [];
    }
}
