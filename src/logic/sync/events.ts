import { D2CategoryOptionCombo } from "d2-api";
import _ from "lodash";
import memoize from "nano-memoize";
import Instance, { MetadataMappingDictionary } from "../../models/instance";
import { DataImportResponse } from "../../types/d2";
import { EventsPackage, ProgramEvent, ProgramEventDataValue } from "../../types/synchronization";
import {
    buildMetadataDictionary,
    cleanDataImportResponse,
    cleanOrgUnitPath,
    getCategoryOptionCombos,
    getEventsData,
    mapCategoryOptionCombo,
    mapOptionValue,
    mapProgramDataElement,
    postEventsData,
} from "../../utils/synchronization";
import { GenericSync, SyncronizationPayload } from "./generic";

export class EventsSync extends GenericSync {
    protected readonly type = "events";
    protected readonly fields =
        "id,name,programStages[programStageDataElements[dataElement[id,displayFormName,name]]]";

    public buildPayload = memoize(async () => {
        const { dataParams = {} } = this.builder;
        const { programs = [] } = await this.extractMetadata();

        const events = await getEventsData(
            this.api,
            dataParams,
            programs.map(({ id }) => id)
        );

        return { events };
    });

    protected async postPayload(instance: Instance) {
        const { dataParams = {} } = this.builder;

        const payloadPackage = await this.buildPayload();
        const mappedPayloadPackage = await this.mapMetadata(instance, payloadPackage);
        console.debug("Events package", { payloadPackage, mappedPayloadPackage });

        return postEventsData(instance, mappedPayloadPackage, dataParams);
    }

    protected cleanResponse(response: DataImportResponse, instance: Instance) {
        return cleanDataImportResponse(response, instance);
    }

    protected async buildDataStats() {
        const metadataPackage = await this.extractMetadata();
        const dictionary = buildMetadataDictionary(metadataPackage);
        const { events } = (await this.buildPayload()) as EventsPackage;

        return _(events)
            .groupBy("program")
            .mapValues((array, program) => ({
                program: dictionary[program]?.name ?? program,
                count: array.length,
                orgUnits: _.uniq(array.map(({ orgUnit, orgUnitName }) => orgUnitName ?? orgUnit)),
            }))
            .values()
            .value();
    }

    protected async mapMetadata(
        instance: Instance,
        payload: EventsPackage
    ): Promise<SyncronizationPayload> {
        const { events: oldEvents } = payload;
        const originCategoryOptionCombos = await getCategoryOptionCombos(this.api);
        const destinationCategoryOptionCombos = await getCategoryOptionCombos(instance.getApi());

        const events = oldEvents
            .map(dataValue =>
                this.buildMappedDataValue(
                    dataValue,
                    instance.metadataMapping,
                    originCategoryOptionCombos,
                    destinationCategoryOptionCombos
                )
            )
            .filter(this.isDisabledEvent);

        return { events };
    }

    private buildMappedDataValue(
        { orgUnit, program, programStage, dataValues, attributeOptionCombo, ...rest }: ProgramEvent,
        globalMapping: MetadataMappingDictionary,
        originCategoryOptionCombos: Partial<D2CategoryOptionCombo>[],
        destinationCategoryOptionCombos: Partial<D2CategoryOptionCombo>[]
    ): ProgramEvent {
        const { organisationUnits = {}, programs = {} } = globalMapping;
        const { mappedId: mappedProgram = program, mapping: innerMapping = {} } =
            programs[program] ?? {};
        const { programStages = {} } = innerMapping;
        const mappedOrgUnit = organisationUnits[orgUnit]?.mappedId ?? orgUnit;
        const mappedProgramStage = programStages[programStage]?.mappedId ?? programStage;
        const mappedCategory = attributeOptionCombo
            ? mapCategoryOptionCombo(
                  attributeOptionCombo,
                  [innerMapping, globalMapping],
                  originCategoryOptionCombos,
                  destinationCategoryOptionCombos
              )
            : undefined;

        return _.omit(
            {
                orgUnit: cleanOrgUnitPath(mappedOrgUnit),
                program: mappedProgram,
                programStage: mappedProgramStage,
                attributeOptionCombo: mappedCategory,
                dataValues: dataValues
                    .map(({ dataElement, value, ...rest }) => {
                        const {
                            mappedId: mappedDataElement = dataElement,
                            mapping: dataElementMapping = {},
                        } = mapProgramDataElement(
                            program,
                            programStage,
                            dataElement,
                            globalMapping
                        );

                        const mappedValue = mapOptionValue(value, [
                            dataElementMapping,
                            globalMapping,
                        ]);

                        return {
                            dataElement: mappedDataElement,
                            value: mappedValue,
                            ...rest,
                        };
                    })
                    .filter(this.isDisabledEvent),
                ...rest,
            },
            ["orgUnitName", "attributeCategoryOptions"]
        );
    }

    private isDisabledEvent(event: ProgramEvent | ProgramEventDataValue): boolean {
        return !_(event)
            .pick(["orgUnit", "attributeOptionCombo", "dataElement", "value"])
            .values()
            .includes("DISABLED");
    }
}
