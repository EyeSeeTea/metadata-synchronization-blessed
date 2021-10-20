import _ from "lodash";
import { mapCategoryOptionCombo, mapOptionValue, mapProgramDataElement } from "../../../utils/synchronization";
import { interpolate } from "../../../utils/uid-replacement";
import { MetadataMapping, MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { CategoryOptionCombo } from "../../metadata/entities/MetadataEntities";
import { SynchronizationPayload } from "../../synchronization/entities/SynchronizationPayload";
import { PayloadMapper } from "../../synchronization/mapper/PayloadMapper";
import { cleanOrgUnitPath } from "../../synchronization/utils";
import { EventsPackage } from "../entities/EventsPackage";
import { ProgramEvent } from "../entities/ProgramEvent";
import { ProgramEventDataValue } from "../entities/ProgramEventDataValue";
import { ProgramStageRef } from "./Models";

export class EventsPayloadMapper implements PayloadMapper {
    constructor(
        private mapping: MetadataMappingDictionary,
        private originCategoryOptionCombos: Partial<CategoryOptionCombo>[],
        private destinationCategoryOptionCombos: Partial<CategoryOptionCombo>[],
        private defaultCategoryOptionCombo: string,
        private destinationMappedProgramStages: ProgramStageRef[]
    ) {}

    map(payload: SynchronizationPayload): Promise<SynchronizationPayload> {
        return Promise.resolve(this.mapPayload(payload as EventsPackage));
    }

    public async mapPayload({ events: oldEvents }: EventsPackage): Promise<SynchronizationPayload> {
        const events = oldEvents
            .map(event =>
                this.buildMappedEvent(
                    event,
                    this.mapping,
                    this.originCategoryOptionCombos,
                    this.destinationCategoryOptionCombos,
                    this.defaultCategoryOptionCombo
                )
            )
            .filter(this.isDisabledEvent);

        return { events };
    }

    private buildMappedEvent(
        { orgUnit, program, programStage, dataValues, attributeOptionCombo, ...rest }: ProgramEvent,
        globalMapping: MetadataMappingDictionary,
        originCategoryOptionCombos: Partial<CategoryOptionCombo>[],
        destinationCategoryOptionCombos: Partial<CategoryOptionCombo>[],
        defaultCategoryOptionCombo: string
    ): ProgramEvent {
        const { organisationUnits = {} } = globalMapping;

        const {
            mappedProgram,
            programStages,
            innerMapping,
            overlaps = {},
        } = this.getRelatedProgramMappings(globalMapping, program, programStage);

        const mappedProgramStage =
            this.getProgramStageMapping(program, programStage, programStages).mappedId ?? programStage;

        const mappedOrgUnit = organisationUnits[orgUnit]?.mappedId ?? orgUnit;

        const mappedCategory = mapCategoryOptionCombo(
            attributeOptionCombo ?? defaultCategoryOptionCombo,
            [innerMapping, globalMapping],
            originCategoryOptionCombos,
            destinationCategoryOptionCombos
        );

        const mappedDataValues = dataValues
            .map(({ dataElement, value, ...rest }) => {
                const { mappedId: mappedDataElement = dataElement, mapping: dataElementMapping = {} } =
                    mapProgramDataElement(program, programStage, dataElement, globalMapping);

                const mappedValue = mapOptionValue(value, [dataElementMapping, globalMapping]);

                return {
                    originalDataElement: dataElement,
                    dataElement: mappedDataElement,
                    value: mappedValue,
                    ...rest,
                };
            })
            .filter(this.isDisabledEvent);

        const overlappedDataValues = _(mappedDataValues)
            .groupBy(item => item.dataElement)
            .mapValues(items => {
                const defaultItem = items[0];
                const { replacer } = overlaps[defaultItem.dataElement] ?? {};
                if (!replacer) return _.omit(defaultItem, ["originalDataElement"]);

                const dictionary = _.fromPairs(items.map(item => [item.originalDataElement, item.value]));
                const value = interpolate(replacer, dictionary);

                const item = _.omit({ ...defaultItem, value }, ["originalDataElement"]);

                return item;
            })
            .values()
            .value();

        return _.omit(
            {
                orgUnit: cleanOrgUnitPath(mappedOrgUnit),
                program: mappedProgram,
                programStage: mappedProgramStage,
                attributeOptionCombo: mappedCategory,
                dataValues: overlappedDataValues,
                ...rest,
            },
            ["orgUnitName", "attributeCategoryOptions"]
        );
    }

    private getRelatedProgramMappings(
        globalMapping: MetadataMappingDictionary,
        originProgram: string,
        originProgramStage: string
    ) {
        const { eventPrograms = {}, trackerPrograms = {}, trackerProgramStages = {} } = globalMapping;

        const complexId = `${originProgram}-${originProgramStage}`;

        if (eventPrograms[originProgram]) {
            const {
                mappedId: mappedProgram = originProgram,
                mapping: innerMapping = {},
                overlaps,
            } = eventPrograms[originProgram] ?? {};

            const { programStages = {} } = innerMapping;

            return { mappedProgram, innerMapping, programStages, overlaps };
        } else if (trackerPrograms[originProgram]) {
            const { mappedId: mappedProgram = originProgram, mapping: innerMapping = {} } =
                trackerPrograms[originProgram] ?? {};

            return { mappedProgram, innerMapping, programStages: trackerProgramStages };
        } else if (trackerProgramStages[complexId]) {
            const destinationProgramStage = trackerProgramStages[complexId].mappedId;

            const mappedProgram = this.getMappedProgramByProgramStage(destinationProgramStage) ?? originProgram;

            return {
                mappedProgram,
                innerMapping: {},
                programStages: trackerProgramStages,
            };
        } else {
            return {
                mappedProgram: originProgram,
                innerMapping: {},
                programStages: trackerProgramStages,
            };
        }
    }

    private getMappedProgramByProgramStage(destinationProgramStage?: string): string | undefined {
        if (destinationProgramStage && destinationProgramStage !== "DISABLED") {
            const programStage = this.destinationMappedProgramStages.find(
                programStage => programStage.id === destinationProgramStage
            );

            return programStage?.program.id;
        } else {
            return "DISABLED";
        }
    }

    private getProgramStageMapping = (
        originProgram: string,
        originProgramStage: string,
        programStagesMapping: Record<string, MetadataMapping>
    ): MetadataMapping => {
        const complexId = `${originProgram}-${originProgramStage}`;
        const candidate = programStagesMapping[complexId]?.mappedId
            ? programStagesMapping[complexId]
            : programStagesMapping[originProgramStage];

        return candidate ?? {};
    };

    private isDisabledEvent(event: ProgramEvent | ProgramEventDataValue): boolean {
        return !_(event)
            .pick(["program", "orgUnit", "attributeOptionCombo", "dataElement", "value"])
            .values()
            .includes("DISABLED");
    }
}
