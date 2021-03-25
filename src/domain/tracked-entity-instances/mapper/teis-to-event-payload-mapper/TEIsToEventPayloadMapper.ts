import { generateUid } from "d2/uid";
import moment from "moment";
import { mapOptionValue } from "../../../../utils/synchronization";
import { ProgramEvent } from "../../../events/entities/ProgramEvent";
import { ProgramEventDataValue } from "../../../events/entities/ProgramEventDataValue";
import { MetadataMappingDictionary } from "../../../mapping/entities/MetadataMapping";
import { SynchronizationPayload } from "../../../synchronization/entities/SynchronizationPayload";
import { PayloadMapper } from "../../../synchronization/mapper/PayloadMapper";
import { cleanOrgUnitPath } from "../../../synchronization/utils";
import { Enrollment } from "../../entities/Enrollment";
import { TEIsPackage } from "../../entities/TEIsPackage";
import { TrackedEntityInstance } from "../../entities/TrackedEntityInstance";
import { ProgramRef } from "../Models";

export class TEIsToEventPayloadMapper implements PayloadMapper {
    constructor(
        private mapping: MetadataMappingDictionary,
        private allPosibleDestinationPrograms: ProgramRef[]
    ) {}

    map(payload: SynchronizationPayload): Promise<SynchronizationPayload> {
        const teiPackage = payload as TEIsPackage;

        const date = moment().toISOString();

        const destinationEventPrograms = this.allPosibleDestinationPrograms.filter(
            program =>
                program.programType === "WITHOUT_REGISTRATION" &&
                teiPackage.trackedEntityInstances.some(tei =>
                    tei.enrollments.some(enrollment => enrollment.program === program.id)
                )
        );

        const destinationEventProgramIds = destinationEventPrograms.map(({ id }) => id);

        const events = teiPackage.trackedEntityInstances.reduce(
            (acc: ProgramEvent[], tei: TrackedEntityInstance) => {
                const eventsByEnrollments = tei.enrollments
                    .filter(enrollment => destinationEventProgramIds.includes(enrollment.program))
                    .reduce((acc: ProgramEvent[], enrollment: Enrollment) => {
                        const {
                            organisationUnits = {},
                            trackerPrograms = {},
                            trackedEntityAttributesToDE = {},
                        } = this.mapping;

                        const mappedOrgUnit =
                            organisationUnits[tei.orgUnit]?.mappedId ?? tei.orgUnit;
                        const mappedProgram = trackerPrograms[enrollment.program]?.mappedId;

                        destinationEventPrograms.find(program => program.id === mappedProgram);

                        const mappedProgramStage = destinationEventPrograms.find(
                            program => program.id === mappedProgram
                        )?.id;

                        if (mappedProgram === undefined || mappedProgramStage === undefined) {
                            return acc;
                        } else {
                            const id = generateUid();
                            const event = {
                                event: generateUid(),
                                eventDate: enrollment.enrollmentDate,
                                orgUnit: cleanOrgUnitPath(mappedOrgUnit),
                                program: mappedProgram,
                                programStage: mappedProgramStage,
                                deleted: false,
                                created: date,
                                dueDate: date,
                                lastUpdated: date,
                                dataValues: tei.attributes
                                    .filter(
                                        att =>
                                            trackedEntityAttributesToDE[att.attribute] !== undefined
                                    )
                                    .map(att => {
                                        const mappedDataElement = trackedEntityAttributesToDE[
                                            att.attribute
                                        ]?.mappedId as string;

                                        return {
                                            created: date,
                                            lastUpdated: date,
                                            dataElement: mappedDataElement,
                                            value: mapOptionValue(att.value, [
                                                trackedEntityAttributesToDE[att.attribute]
                                                    ?.mapping ?? {},
                                            ]),
                                            storedBy: "",
                                            providedElsewhere: false,
                                        };
                                    }),
                                id,
                                status: "ACTIVE",
                                storedBy: "",
                                href: "",
                            };

                            return [...acc, event as ProgramEvent];
                        }
                    }, []);

                return [...acc, ...eventsByEnrollments];
            },
            []
        );

        const eventsWithoutDisabled = this.removeDisabledItems(events);

        return Promise.resolve({ events: eventsWithoutDisabled });
    }

    private removeDisabledItems(events: ProgramEvent[]): ProgramEvent[] {
        return events
            .map(event => {
                return {
                    ...event,
                    dataValues: event.dataValues.filter(
                        dataValue => !this.isDisabledDataValue(dataValue)
                    ),
                };
            })
            .filter(item => !this.isDisabledEvent(item));
    }

    private isDisabledEvent(item: ProgramEvent): boolean {
        return (
            item.orgUnit === "DISABLED" ||
            item.program === "DISABLED" ||
            item.programStage === "DISABLED"
        );
    }

    private isDisabledDataValue(item: ProgramEventDataValue): boolean {
        return item.dataElement === "DISABLED" || item.value === "DISABLED";
    }
}
