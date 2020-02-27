import _ from "lodash";
import memoize from "nano-memoize";
import Instance, { MetadataMappingDictionary } from "../../models/instance";
import { DataImportResponse } from "../../types/d2";
import { EventsPackage, ProgramEvent } from "../../types/synchronization";
import {
    buildMetadataDictionary,
    cleanDataImportResponse,
    getEventsData,
    postEventsData,
    cleanOrgUnitPath,
    getCategoryOptionCombos,
    mapCategoryOptionCombo,
} from "../../utils/synchronization";
import { GenericSync, SyncronizationPayload } from "./generic";
import { D2CategoryOptionCombo } from "d2-api";

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

        const events = oldEvents.map(dataValue =>
            this.buildMappedDataValue(
                dataValue,
                instance.metadataMapping,
                originCategoryOptionCombos,
                destinationCategoryOptionCombos
            )
        );

        return { events };
    }

    private buildMappedDataValue(
        { orgUnit, program, programStage, dataValues, attributeOptionCombo, ...rest }: ProgramEvent,
        mapping: MetadataMappingDictionary,
        originCategoryOptionCombos: Partial<D2CategoryOptionCombo>[],
        destinationCategoryOptionCombos: Partial<D2CategoryOptionCombo>[]
    ): ProgramEvent {
        const {
            organisationUnits = {},
            dataElements = {},
            programs = {},
            programStages = {},
        } = mapping;
        const { mappedId: mappedProgram = program, mapping: innerProgramMapping = {} } =
            programs[program] ?? {};
        const mappedOrgUnit = organisationUnits[orgUnit]?.mappedId ?? orgUnit;
        const mappedProgramStage = programStages[programStage]?.mappedId ?? programStage;
        const mappedCategory = attributeOptionCombo
            ? mapCategoryOptionCombo(
                  attributeOptionCombo,
                  innerProgramMapping,
                  originCategoryOptionCombos,
                  destinationCategoryOptionCombos
              )
            : undefined;

        return _.omit(
            {
                orgUnit: cleanOrgUnitPath(mappedOrgUnit),
                program: mappedProgram,
                programStage: mappedProgramStage,
                attributeOptionCombo: mappedCategory === "DISABLED" ? undefined : mappedCategory,
                dataValues: dataValues.map(({ dataElement, ...rest }) => {
                    const mappedDataElement = dataElements[dataElement]?.mappedId ?? dataElement;

                    return {
                        dataElement: mappedDataElement,
                        ...rest,
                    };
                }),
                ...rest,
            },
            ["orgUnitName", "attributeCategoryOptions"]
        );
    }
}
