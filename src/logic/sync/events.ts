import { D2CategoryOptionCombo, D2Program } from "d2-api";
import { generateUid } from "d2/uid";
import _ from "lodash";
import memoize from "nano-memoize";
import Instance, { MetadataMappingDictionary } from "../../models/instance";
import {
    DataValue,
    EventsPackage,
    ProgramEvent,
    ProgramEventDataValue,
} from "../../types/synchronization";
import {
    buildMetadataDictionary,
    cleanDataImportResponse,
    cleanOrgUnitPath,
    getAnalyticsData,
    getCategoryOptionCombos,
    getDefaultIds,
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

        const events = (
            await getEventsData(
                this.api,
                dataParams,
                programs.map(({ id }) => id)
            )
        ).map(event => {
            return dataParams.generateNewUid ? { ...event, event: generateUid() } : event;
        });

        const directIndicators = programIndicators.map(({ id }) => id);
        const indicatorsByProgram = _.flatten(
            programs?.map(
                ({ programIndicators }: Partial<D2Program>) =>
                    programIndicators?.map(({ id }) => id) ?? []
            )
        );

        const { dataValues: candidateDataValues = [] } = enableAggregation
            ? await getAnalyticsData({
                  api: this.api,
                  dataParams,
                  dimensionIds: [...directIndicators, ...indicatorsByProgram],
                  includeCategories: false,
              })
            : {};

        const dataValues = _.reject(candidateDataValues, ({ dataElement }) =>
            excludedIds.includes(dataElement)
        );

        return { events, dataValues };
    });

    public async postPayload(instance: Instance) {
        const { events, dataValues } = await this.buildPayload();

        const eventsResponse = await this.postEventsPayload(instance, events);
        const indicatorsResponse = await this.postIndicatorPayload(instance, dataValues);

        return _.compact([eventsResponse, indicatorsResponse]);
    }

    private async postEventsPayload(instance: Instance, events: ProgramEvent[]) {
        const { dataParams = {} } = this.builder;

        const payload = await this.mapPayload(instance, { events });
        console.debug("Events package", { events, payload });
        const response = await postEventsData(instance, payload, dataParams);

        return cleanDataImportResponse(response, instance, this.type);
    }

    private async postIndicatorPayload(instance: Instance, dataValues: DataValue[]) {
        const { dataParams = {} } = this.builder;
        const { enableAggregation } = dataParams;
        if (!enableAggregation) return undefined;

        const aggregatedSync = new AggregatedSync(this.d2, this.api, this.builder);
        const payload = await aggregatedSync.mapPayload(instance, { dataValues });
        console.debug("Program indicator package", { dataValues, payload });
        const response = await postAggregatedData(instance, payload, dataParams);

        return cleanDataImportResponse(response, instance, aggregatedSync.type);
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
        const defaultCategoryOptionCombos = await getDefaultIds(this.api, "categoryOptionCombos");

        const events = oldEvents
            .map(dataValue =>
                this.buildMappedDataValue(
                    dataValue,
                    instance.metadataMapping,
                    originCategoryOptionCombos,
                    destinationCategoryOptionCombos,
                    defaultCategoryOptionCombos[0]
                )
            )
            .filter(this.isDisabledEvent);

        return { events };
    }

    private buildMappedDataValue(
        { orgUnit, program, programStage, dataValues, attributeOptionCombo, ...rest }: ProgramEvent,
        globalMapping: MetadataMappingDictionary,
        originCategoryOptionCombos: Partial<D2CategoryOptionCombo>[],
        destinationCategoryOptionCombos: Partial<D2CategoryOptionCombo>[],
        defaultCategoryOptionCombo: string
    ): ProgramEvent {
        const { organisationUnits = {}, eventPrograms = {} } = globalMapping;
        const { mappedId: mappedProgram = program, mapping: innerMapping = {} } =
            eventPrograms[program] ?? {};
        const { programStages = {} } = innerMapping;
        const mappedOrgUnit = organisationUnits[orgUnit]?.mappedId ?? orgUnit;
        const mappedProgramStage = programStages[programStage]?.mappedId ?? programStage;
        const mappedCategory = mapCategoryOptionCombo(
            attributeOptionCombo ?? defaultCategoryOptionCombo,
            [innerMapping, globalMapping],
            originCategoryOptionCombos,
            destinationCategoryOptionCombos
        );

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
