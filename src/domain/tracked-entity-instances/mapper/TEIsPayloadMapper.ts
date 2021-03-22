import { MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { SynchronizationPayload } from "../../synchronization/entities/SynchronizationPayload";
import { PayloadMapper } from "../../synchronization/mapper/PayloadMapper";
import { TEIsPackage } from "../entities/TEIsPackage";
import { TrackedEntityInstance } from "../entities/TrackedEntityInstance";

export class TEIsPayloadMapper implements PayloadMapper {
    constructor(private mapping: MetadataMappingDictionary) {}

    map(payload: SynchronizationPayload): Promise<SynchronizationPayload> {
        const teiPackage = payload as TEIsPackage;

        const trackedEntityInstances = teiPackage.trackedEntityInstances.map(tei => {
            const { relationshipTypes = {} } = this.mapping;

            return {
                ...tei,
                relationships: tei.relationships.map(rel => {
                    const relationshipTypeId =
                        relationshipTypes[rel.relationshipType]?.mappedId ?? rel.relationshipType;

                    return {
                        ...rel,
                        relationshipType: relationshipTypeId,
                    };
                }),
            };
        });

        const mappedPayload = this.removeDuplicateRelationShips(trackedEntityInstances);

        return Promise.resolve(mappedPayload);
    }

    private removeDuplicateRelationShips(teis: TrackedEntityInstance[]): TEIsPackage {
        const trackedEntityInstances = teis.reduce(
            (acc: TrackedEntityInstance[], tei: TrackedEntityInstance) => {
                return [
                    ...acc,
                    {
                        ...tei,
                        relationships: tei.relationships.filter(rel => {
                            const existedRelationships = acc.some(existedTei =>
                                existedTei.relationships.some(
                                    existedRel => existedRel.relationship === rel.relationship
                                )
                            );

                            return !existedRelationships;
                        }),
                    },
                ];
            },
            []
        );

        return { trackedEntityInstances };
    }
}
