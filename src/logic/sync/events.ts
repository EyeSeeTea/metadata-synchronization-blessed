import { D2CategoryOptionCombo, D2Program } from "d2-api";
import _ from "lodash";
import memoize from "nano-memoize";
import Instance, { MetadataMappingDictionary } from "../../models/instance";
import { EventsPackage, ProgramEvent, ProgramEventDataValue } from "../../types/synchronization";
import {
    buildMetadataDictionary,
    cleanDataImportResponse,
    cleanOrgUnitPath,
    getAnalyticsData,
    getCategoryOptionCombos,
    getEventsData,
    mapCategoryOptionCombo,
    mapOptionValue,
    mapProgramDataElement,
    postAggregatedData,
    postEventsData,
} from "../../utils/synchronization";
import { AggregatedSync } from "./aggregated";
import { GenericSync, SyncronizationPayload } from "./generic";

export class EventsSync extends GenericSync {
    public readonly type = "events";
    public readonly fields =
        "id,name,programStages[programStageDataElements[dataElement[id,displayFormName,name]]],programIndicators[id,name]";

    public buildPayload = memoize(async () => {
        const { dataParams = {}, excludedIds = [] } = this.builder;
        const { enableAggregation = false } = dataParams;
        const { programs = [], programIndicators = [] } = await this.extractMetadata();

        const events = await getEventsData(
            this.api,
            dataParams,
            programs.map(({ id }) => id)
        );

        const directIndicators = programIndicators.map(({ id }) => id);
        const indicatorsByProgram = _.flatten(
            programs?.map(
                ({ programIndicators }: Partial<D2Program>) =>
                    programIndicators?.map(({ id }) => id) ?? []
            )
        );

        const { dataValues: candidateDataValues = [] } = enableAggregation
            ? await getAnalyticsData(
                  this.api,
                  dataParams,
                  [],
                  [...directIndicators, ...indicatorsByProgram]
              )
            : {};

        const dataValues = _.reject(candidateDataValues, ({ dataElement }) =>
            excludedIds.includes(dataElement)
        );

        return { events, dataValues };
    });

    public async postPayload(instance: Instance) {
        const { dataParams = {} } = this.builder;
        const { events, dataValues } = await this.buildPayload();
        const aggregatedSync = new AggregatedSync(this.d2, this.api, this.builder);

        const mappedEvents = await this.mapPayload(instance, { events });
        const mappedDataValues = await aggregatedSync.mapPayload(instance, { dataValues });
        console.debug("Events package", { events, dataValues, mappedEvents, mappedDataValues });

        const responseEvents = await postEventsData(instance, mappedEvents, dataParams);
        const responseDataValues = await postAggregatedData(instance, mappedDataValues, dataParams);

        const syncResultEvents = cleanDataImportResponse(responseEvents, instance, this.type);
        const syncResultDataValues = cleanDataImportResponse(
            responseDataValues,
            instance,
            aggregatedSync.type
        );
        return [syncResultEvents, syncResultDataValues];
    }

    public async buildDataStats() {
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

    public async mapPayload(
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
        const { organisationUnits = {}, eventPrograms = {} } = globalMapping;
        const { mappedId: mappedProgram = program, mapping: innerMapping = {} } =
            eventPrograms[program] ?? {};
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
