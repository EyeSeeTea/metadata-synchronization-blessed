import { generateUid } from "d2/uid";
import _ from "lodash";
import memoize from "nano-memoize";
import { D2Program } from "../../../types/d2-api";
import { promiseMap } from "../../../utils/common";
import { debug } from "../../../utils/debug";
import { mapCategoryOptionCombo, mapOptionValue, mapProgramDataElement } from "../../../utils/synchronization";
import { interpolate } from "../../../utils/uid-replacement";
import { DataValue } from "../../aggregated/entities/DataValue";
import { AggregatedSyncUseCase } from "../../aggregated/usecases/AggregatedSyncUseCase";
import { Instance } from "../../instance/entities/Instance";
import { MetadataMapping, MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { CategoryOptionCombo, Program } from "../../metadata/entities/MetadataEntities";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { SynchronizationPayload } from "../../synchronization/entities/SynchronizationPayload";
import { GenericSyncUseCase } from "../../synchronization/usecases/GenericSyncUseCase";
import { buildMetadataDictionary, cleanOrgUnitPath } from "../../synchronization/utils";
import { TEIsPackage } from "../../tracked-entity-instances/entities/TEIsPackage";
import { TrackedEntityInstance } from "../../tracked-entity-instances/entities/TrackedEntityInstance";
import {
    createTEIsPayloadMapper,
    createTEIsToEventPayloadMapper,
} from "../../tracked-entity-instances/mapper/TEIsPayloadMapperFactory";
import { EventsPackage } from "../entities/EventsPackage";
import { ProgramEvent } from "../entities/ProgramEvent";
import { ProgramEventDataValue } from "../entities/ProgramEventDataValue";

export class EventsSyncUseCase extends GenericSyncUseCase {
    public readonly type = "events";
    public readonly fields =
        "id,name,programType,programStages[id,displayFormName,programStageDataElements[dataElement[id,displayFormName,name]]],programIndicators[id,name],program";

    public buildPayload = memoize(async () => {
        const { dataParams = {}, excludedIds = [] } = this.builder;
        const { enableAggregation = false } = dataParams;
        const eventsRepository = await this.getEventsRepository();
        const aggregatedRepository = await this.getAggregatedRepository();
        const teisRepository = await this.getTeisRepository();

        const { programs = [], programIndicators = [], programStages = [] } = await this.extractMetadata();

        const stageIdsFromPrograms = programs
            ? (programs as Program[]).map(program => program.programStages.map(({ id }) => id)).flat()
            : [];

        const progamStageIds = [...programStages.map(({ id }) => id), ...stageIdsFromPrograms];

        const events = (await eventsRepository.getEvents(dataParams, [...new Set(progamStageIds)])).map(event => {
            return dataParams.generateNewUid ? { ...event, event: generateUid() } : event;
        });

        const trackedEntityInstances = dataParams.teis
            ? await teisRepository.getTEIsById(dataParams, dataParams.teis)
            : [];

        const directIndicators = programIndicators.map(({ id }) => id);
        const indicatorsByProgram = _.flatten(
            programs?.map(({ programIndicators }: Partial<D2Program>) => programIndicators?.map(({ id }) => id) ?? [])
        );

        const dataElementsByProgram = _(programs)
            .flatMap(({ id, programStages }: Partial<D2Program>) =>
                _.flatMap(
                    programStages,
                    ({ programStageDataElements }) =>
                        programStageDataElements.map(({ dataElement }) => `${id}.${dataElement.id}`) ?? []
                )
            )
            .value();

        const { dataValues: candidateDataValues = [] } = enableAggregation
            ? await aggregatedRepository.getAnalytics({
                  dataParams,
                  dimensionIds: [...directIndicators, ...indicatorsByProgram, ...dataElementsByProgram],
                  includeCategories: false,
              })
            : {};

        const dataValues = _.reject(candidateDataValues, ({ dataElement }) => excludedIds.includes(dataElement));

        return { events, dataValues, trackedEntityInstances };
    });

    public async postPayload(instance: Instance): Promise<SynchronizationResult[]> {
        const { events, dataValues, trackedEntityInstances } = await this.buildPayload();

        const teisResponse =
            trackedEntityInstances && trackedEntityInstances.length > 0
                ? await this.postTEIsPayload(instance, trackedEntityInstances)
                : undefined;

        const eventsResponse = await this.postEventsPayload(instance, events, trackedEntityInstances);
        const indicatorsResponse = await this.postIndicatorPayload(instance, dataValues);

        return _.compact([eventsResponse, indicatorsResponse, teisResponse]);
    }

    private async postEventsPayload(
        instance: Instance,
        events: ProgramEvent[],
        teis: TrackedEntityInstance[]
    ): Promise<SynchronizationResult> {
        const { dataParams = {} } = this.builder;

        const mapping = await this.getMapping(instance);
        const mapper = await createTEIsToEventPayloadMapper(await this.getMetadataRepository(instance), mapping);

        const payloadByTEIs = (await mapper.map({ trackedEntityInstances: teis })) as EventsPackage;

        const payloadByEvents = (await this.mapPayload(instance, { events })) as EventsPackage;

        const payload = { events: [...payloadByTEIs.events, ...payloadByEvents.events] };

        debug("Events package", { events, eventsByTeis: payloadByTEIs.events, payload });

        const eventsRepository = await this.getEventsRepository(instance);
        const syncResult = await eventsRepository.save(payload, dataParams);
        const origin = await this.getOriginInstance();

        return { ...syncResult, origin: origin.toPublicObject(), payload };
    }

    private async postTEIsPayload(
        instance: Instance,
        trackedEntityInstances: TrackedEntityInstance[]
    ): Promise<SynchronizationResult> {
        const { dataParams = {} } = this.builder;
        const { excludeTeiRelationships = false } = dataParams;

        const teis = excludeTeiRelationships
            ? trackedEntityInstances.map(tei => ({ ...tei, relationships: [] }))
            : trackedEntityInstances;

        const mapping = await this.getMapping(instance);

        const mapper = await createTEIsPayloadMapper(await this.getMetadataRepository(instance), teis, mapping);

        const payload = (await mapper.map({ trackedEntityInstances: teis })) as TEIsPackage;

        debug("TEIS package", { trackedEntityInstances, payload });

        const teisRepository = await this.getTeisRepository(instance);
        const syncResult = await teisRepository.save(payload, dataParams);
        const origin = await this.getOriginInstance();

        return { ...syncResult, origin: origin.toPublicObject(), payload };
    }

    private async postIndicatorPayload(
        instance: Instance,
        dataValues: DataValue[]
    ): Promise<SynchronizationResult | undefined> {
        const { dataParams = {} } = this.builder;
        const { enableAggregation } = dataParams;
        if (!enableAggregation) return undefined;

        // TODO: This is an external action and should be called by user
        const aggregatedSync = new AggregatedSyncUseCase(this.builder, this.repositoryFactory, this.localInstance);

        const mappedPayload = await aggregatedSync.mapPayload(instance, { dataValues });

        const existingPayload = dataParams.ignoreDuplicateExistingValues
            ? await aggregatedSync.mapPayload(instance, await aggregatedSync.buildPayload(instance))
            : { dataValues: [] };

        const payload = aggregatedSync.filterPayload(mappedPayload, existingPayload);
        debug("Program indicator package", {
            originalPayload: { dataValues },
            mappedPayload,
            existingPayload,
            payload,
        });

        const aggregatedRepository = await this.getAggregatedRepository(instance);
        const syncResult = await aggregatedRepository.save(payload, dataParams);
        const origin = await this.getOriginInstance();

        return { ...syncResult, origin: origin.toPublicObject(), payload };
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

    public async mapPayload(instance: Instance, { events: oldEvents }: EventsPackage): Promise<SynchronizationPayload> {
        const metadataRepository = await this.getMetadataRepository();
        const remoteMetadataRepository = await this.getMetadataRepository(instance);

        const originCategoryOptionCombos = await metadataRepository.getCategoryOptionCombos();
        const destinationCategoryOptionCombos = await remoteMetadataRepository.getCategoryOptionCombos();
        const defaultCategoryOptionCombos = await metadataRepository.getDefaultIds("categoryOptionCombos");

        const mapping = await this.getMapping(instance);
        const events = (
            await promiseMap(oldEvents, dataValue =>
                this.buildMappedDataValue(
                    instance,
                    dataValue,
                    mapping,
                    originCategoryOptionCombos,
                    destinationCategoryOptionCombos,
                    defaultCategoryOptionCombos[0]
                )
            )
        ).filter(this.isDisabledEvent);

        return { events };
    }

    private async buildMappedDataValue(
        instance: Instance,
        { orgUnit, program, programStage, dataValues, attributeOptionCombo, ...rest }: ProgramEvent,
        globalMapping: MetadataMappingDictionary,
        originCategoryOptionCombos: Partial<CategoryOptionCombo>[],
        destinationCategoryOptionCombos: Partial<CategoryOptionCombo>[],
        defaultCategoryOptionCombo: string
    ): Promise<ProgramEvent> {
        const { organisationUnits = {} } = globalMapping;

        const {
            mappedProgram,
            programStages,
            innerMapping,
            overlaps = {},
        } = await this.getRelatedProgramMappings(instance, globalMapping, program, programStage);

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
                if (!replacer) return defaultItem;

                const dictionary = _.fromPairs(items.map(item => [item.originalDataElement, item.value]));
                const value = interpolate(replacer, dictionary);

                return _.omit({ ...defaultItem, value }, ["originalDataElement"]);
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

    private async getRelatedProgramMappings(
        instance: Instance,
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

            const mappedProgram =
                (await this.getMappedProgramByProgramStage(instance, destinationProgramStage)) ?? originProgram;

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

    private async getMappedProgramByProgramStage(
        instance: Instance,
        destinationProgramStage?: string
    ): Promise<string | undefined> {
        if (destinationProgramStage && destinationProgramStage !== "DISABLED") {
            const remoteMetadataRepository = await this.getMetadataRepository(instance);

            const result = await remoteMetadataRepository.getMetadataByIds<{
                id: string;
                program: { id: string };
            }>([destinationProgramStage], "id, program");

            return result.programStages ? result.programStages[0].program.id : undefined;
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
            .pick(["orgUnit", "attributeOptionCombo", "dataElement", "value"])
            .values()
            .includes("DISABLED");
    }
}
