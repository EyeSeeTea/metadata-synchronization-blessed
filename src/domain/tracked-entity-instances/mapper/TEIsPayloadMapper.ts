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

export class TEIsPayloadMapper implements PayloadMapper {
    constructor(private mapping: MetadataMappingDictionary) {}

    map(payload: SynchronizationPayload): Promise<SynchronizationPayload> {
        const teiPackage = payload as TEIsPackage;

        const trackedEntityInstances = teiPackage.trackedEntityInstances
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
                        .filter(item => !this.isDisabledProgramOwner(item)),
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
                        .filter(item => !this.isDisabledEnrollment(item)),
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
            .filter(item => !this.isDisabledTEI(item));

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
