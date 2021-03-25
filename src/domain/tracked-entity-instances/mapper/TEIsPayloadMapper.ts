import { mapOptionValue } from "../../../utils/synchronization";
import { MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { SynchronizationPayload } from "../../synchronization/entities/SynchronizationPayload";
import { PayloadMapper } from "../../synchronization/mapper/PayloadMapper";
import { cleanOrgUnitPath } from "../../synchronization/utils";
import { Enrollment } from "../entities/Enrollment";
import { Relationship } from "../entities/Relationship";
import { TEIsPackage } from "../entities/TEIsPackage";
import { TrakedEntityAttribute } from "../entities/TrackedEntityAttribute";
import { ProgramOwner, TrackedEntityInstance } from "../entities/TrackedEntityInstance";
import { ProgramRef } from "./Models";

export class TEIsPayloadMapper implements PayloadMapper {
    destinationEventProgramsIds: string[];
    constructor(
        private mapping: MetadataMappingDictionary,
        destinationMappedPrograms: ProgramRef[]
    ) {
        this.destinationEventProgramsIds = destinationMappedPrograms
            .filter(program => program.programType === "WITHOUT_REGISTRATION")
            .map(({ id }) => id);
    }

    map(payload: SynchronizationPayload): Promise<SynchronizationPayload> {
        const teiPackage = payload as TEIsPackage;

        const teis = teiPackage.trackedEntityInstances
            .map(tei => {
                const {
                    relationshipTypes = {},
                    organisationUnits = {},
                    trackerPrograms = {},
                    trackedEntityAttributesToTEI = {},
                } = this.mapping;

                const mappedOrgUnit = organisationUnits[tei.orgUnit]?.mappedId ?? tei.orgUnit;

                return {
                    ...tei,
                    orgUnit: cleanOrgUnitPath(mappedOrgUnit),
                    programOwners: tei.programOwners
                        .map(owner => {
                            const mappedOrgUnit =
                                organisationUnits[owner.ownerOrgUnit]?.mappedId ??
                                owner.ownerOrgUnit;

                            const mappedProgram =
                                trackerPrograms[owner.program]?.mappedId ?? owner.program;

                            return {
                                ...owner,
                                ownerOrgUnit: cleanOrgUnitPath(mappedOrgUnit),
                                program: mappedProgram,
                            };
                        })
                        .filter(item => !this.isDisabledProgramOwner(item))
                        .filter(item => !this.destinationEventProgramsIds.includes(item.program)),
                    enrollments: tei.enrollments
                        .map(enrollment => {
                            const mappedOrgUnit =
                                organisationUnits[enrollment.orgUnit]?.mappedId ??
                                enrollment.orgUnit;
                            const mappedProgram =
                                trackerPrograms[enrollment.program]?.mappedId ?? enrollment.program;

                            return {
                                ...enrollment,
                                orgUnit: cleanOrgUnitPath(mappedOrgUnit),
                                program: mappedProgram,
                            };
                        })
                        .filter(item => !this.isDisabledEnrollment(item))
                        .filter(item => !this.destinationEventProgramsIds.includes(item.program)),
                    relationships: tei.relationships
                        .map(rel => {
                            const mappedRelTypeId =
                                relationshipTypes[rel.relationshipType]?.mappedId ??
                                rel.relationshipType;

                            return {
                                ...rel,
                                relationshipType: mappedRelTypeId,
                            };
                        })
                        .filter(item => !this.isDisabledRelationship(item)),
                    attributes: tei.attributes
                        .map(att => {
                            const mappedAttributeId =
                                trackedEntityAttributesToTEI[att.attribute]?.mappedId ??
                                att.attribute;

                            const mappedValue = mapOptionValue(att.value, [
                                trackedEntityAttributesToTEI[att.attribute]?.mapping ?? {},
                                this.mapping,
                            ]);

                            return {
                                ...att,
                                attribute: mappedAttributeId,
                                value: mappedValue,
                            };
                        })
                        .filter(item => !this.isDisabledTrackedEntityAttribute(item)),
                };
            })
            .filter(item => !this.isDisabledTEI(item))
            .filter(item => item.programOwners.length > 0);

        const TeisWithoutDuplicates = this.removeDuplicateRelationShips(teis);

        const TeisWithoutDisabled = this.removeDisabledItems(TeisWithoutDuplicates);

        const trackedEntityInstances = this.removeMappedEventProgramReferences(TeisWithoutDisabled);

        return Promise.resolve({ trackedEntityInstances });
    }

    private removeDisabledItems(teis: TrackedEntityInstance[]): TrackedEntityInstance[] {
        return teis
            .map(tei => {
                return {
                    ...tei,
                    programOwners: tei.programOwners.filter(
                        item => !this.isDisabledProgramOwner(item)
                    ),
                    enrollments: tei.enrollments.filter(item => !this.isDisabledEnrollment(item)),
                    relationships: tei.relationships.filter(
                        item => !this.isDisabledRelationship(item)
                    ),
                    attributes: tei.attributes.filter(
                        item => !this.isDisabledTrackedEntityAttribute(item)
                    ),
                };
            })
            .filter(item => !this.isDisabledTEI(item));
    }

    private removeMappedEventProgramReferences(
        teis: TrackedEntityInstance[]
    ): TrackedEntityInstance[] {
        return teis
            .map(tei => {
                return {
                    ...tei,
                    programOwners: tei.programOwners.filter(
                        item => !this.destinationEventProgramsIds.includes(item.program)
                    ),
                    enrollments: tei.enrollments.filter(
                        item => !this.destinationEventProgramsIds.includes(item.program)
                    ),
                };
            })
            .filter(item => item.programOwners.length > 0);
    }

    private removeDuplicateRelationShips(teis: TrackedEntityInstance[]): TrackedEntityInstance[] {
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

        return trackedEntityInstances;
    }

    private isDisabledTEI(item: TrackedEntityInstance): boolean {
        return item.orgUnit === "DISABLED";
    }

    private isDisabledProgramOwner(item: ProgramOwner): boolean {
        return item.ownerOrgUnit === "DISABLED" || item.program === "DISABLED";
    }

    private isDisabledEnrollment(item: Enrollment): boolean {
        return item.program === "DISABLED" || item.orgUnit === "DISABLED";
    }

    private isDisabledRelationship(item: Relationship): boolean {
        return item.relationshipType === "DISABLED";
    }

    private isDisabledTrackedEntityAttribute(item: TrakedEntityAttribute): boolean {
        return item.attribute === "DISABLED" || item.value === "DISABLED";
    }
}
