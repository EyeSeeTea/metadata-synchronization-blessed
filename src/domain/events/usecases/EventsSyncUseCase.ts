import { generateUid } from "d2/uid";
import _ from "lodash";
import memoize from "nano-memoize";
import { D2Program } from "../../../types/d2-api";
import { promiseMap } from "../../../utils/common";
import { debug } from "../../../utils/debug";
import { DataValue } from "../../aggregated/entities/DataValue";
import { AggregatedSyncUseCase } from "../../aggregated/usecases/AggregatedSyncUseCase";
import { Instance } from "../../instance/entities/Instance";
import { DataElement, Program } from "../../metadata/entities/MetadataEntities";
import { getSuccessDefaultSyncReportByType, SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { SynchronizationPayload } from "../../synchronization/entities/SynchronizationPayload";
import { GenericSyncUseCase } from "../../synchronization/usecases/GenericSyncUseCase";
import { buildMetadataDictionary } from "../../synchronization/utils";
import { TEIsPackage } from "../../tracked-entity-instances/entities/TEIsPackage";
import { TrackedEntityInstance } from "../../tracked-entity-instances/entities/TrackedEntityInstance";
import {
    createTEIsPayloadMapper,
    createTEIsToEventPayloadMapper,
} from "../../tracked-entity-instances/mapper/TEIsPayloadMapperFactory";
import { EventsPackage } from "../entities/EventsPackage";
import { ProgramEvent } from "../entities/ProgramEvent";
import { createEventsPayloadMapper } from "../mapper/EventsPayloadMapperFactory";
// import { promiseMap } from "../../../utils/common";
// import { mapCategoryOptionCombo, mapOptionValue, mapProgramDataElement } from "../../../utils/synchronization";
// import { interpolate } from "../../../utils/uid-replacement";
// import { MetadataMapping, MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
// import { CategoryOptionCombo } from "../../metadata/entities/MetadataEntities";
// import { cleanOrgUnitPath } from "../../synchronization/utils";
// import { ProgramEventDataValue } from "../entities/ProgramEventDataValue";

export class EventsSyncUseCase extends GenericSyncUseCase {
    public readonly type = "events";
    public readonly fields =
        "id,name,programType,programStages[id,displayFormName,programStageDataElements[dataElement[id,displayFormName,name]]],programIndicators[id,name],program";

    public buildPayload = memoize(async () => {
        const { dataParams = {}, excludedIds = [] } = this.builder;
        const { enableAggregation = false, excludeEventCoordinates = false } = dataParams;
        const eventsRepository = await this.getEventsRepository();
        const aggregatedRepository = await this.getAggregatedRepository();
        const teisRepository = await this.getTeisRepository();

        const { programs = [], programIndicators = [], programStages = [] } = await this.extractMetadata();

        const stageIdsFromPrograms = programs
            ? (programs as Program[]).map(program => program.programStages.map(({ id }) => id)).flat()
            : [];

        const progamStageIds = [...programStages.map(({ id }) => id), ...stageIdsFromPrograms];

        const retrievedEvents = (await eventsRepository.getEvents(dataParams, [...new Set(progamStageIds)])).map(
            event => {
                return dataParams.generateNewUid ? { ...event, event: generateUid() } : event;
            }
        );

        const events = excludeEventCoordinates
            ? retrievedEvents.map(event => ({ ...event, geometry: undefined }))
            : retrievedEvents;

        const trackerProgramIds = programs
            .filter(({ programType }) => programType === "WITH_REGISTRATION")
            .map(({ id }) => id);

        const trackedEntityInstances =
            dataParams.allTEIs && trackerProgramIds.length > 0
                ? await teisRepository.getAllTEIs(dataParams, trackerProgramIds)
                : dataParams.teis
                ? await teisRepository.getTEIsById(dataParams, dataParams.teis)
                : [];

        const directIndicators = programIndicators.map(({ id }) => id);
        const indicatorsByProgram = _.flatten(
            programs?.map(({ programIndicators }: Partial<D2Program>) => programIndicators?.map(({ id }) => id) ?? [])
        );

        // Due to a limitation in the analytics endpoint, it's not possible request with dx dimension by program stage and data element
        // only program and data element is allowed. For this reason to avoid duplicate dimension error, we remove data element duplicated
        // using the uniq function. Duplicate data elements is possible for tracker programs here if two stages has the same data element
        // Jira-issue: https://jira.dhis2.org/browse/DHIS2-12382

        const dataElementsByProgram = _(programs)
            .flatMap(({ id, programStages }: Partial<D2Program>) =>
                _.flatMap(
                    programStages,
                    ({ programStageDataElements }) =>
                        programStageDataElements.map(({ dataElement }) => `${id}.${dataElement.id}`) ?? []
                )
            )
            .uniq()
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
        const { dataParams = {} } = this.builder;

        const wasAnyTeiSelectedToSync =
            !!dataParams.allTEIs || (!dataParams.allTEIs && dataParams.teis && dataParams.teis.length > 0);

        const teisResponse =
            trackedEntityInstances && trackedEntityInstances.length > 0
                ? await this.postTEIsPayload(instance, trackedEntityInstances)
                : wasAnyTeiSelectedToSync
                ? getSuccessDefaultSyncReportByType("trackedEntityInstances", instance)
                : undefined;

        const wasAnyEventSelectedToSync =
            !!dataParams.allEvents || (!dataParams.allEvents && dataParams.events && dataParams.events.length > 0);

        const eventsResponse =
            events?.length > 0 || trackedEntityInstances?.length > 0
                ? await this.postEventsPayload(instance, events, trackedEntityInstances)
                : wasAnyEventSelectedToSync
                ? getSuccessDefaultSyncReportByType("events", instance)
                : undefined;

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

        const payloadByTEIs = (await mapper.map({ trackedEntities: teis })) as EventsPackage;

        const finalEvents = await this.manageDataElementWithFileType(events, instance);

        const payloadByEvents = (await this.mapPayload(instance, { events: finalEvents })) as EventsPackage;

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

        const payload = (await mapper.map({ trackedEntities: teis })) as TEIsPackage;

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

    public async mapPayload(instance: Instance, payload: EventsPackage): Promise<SynchronizationPayload> {
        // TODO: when we have mappers for all cases, this method should be removed in base class and use the mappers
        const metadataRepository = await this.getMetadataRepository();
        const remoteMetadataRepository = await this.getMetadataRepository(instance);
        const mapping = await this.getMapping(instance);

        const eventMapper = createEventsPayloadMapper(metadataRepository, remoteMetadataRepository, mapping);
        return (await eventMapper).map(payload);
    }

    private async manageDataElementWithFileType(
        events: ProgramEvent[],
        remoteInstance: Instance
    ): Promise<ProgramEvent[]> {
        const metadataRepository = await this.getMetadataRepository();

        const dataElementIds = _.uniq(events.map(event => event.dataValues.map(dv => dv.dataElement).flat()).flat());

        const { dataElements = [] } = await metadataRepository.getMetadataByIds<DataElement>(
            dataElementIds,
            "id,valueType"
        );

        const dataElementFileTypes = dataElements.filter(de => de.valueType === "FILE_RESOURCE").map(de => de.id);

        const eventsRepository = await this.getEventsRepository();
        const fileRemoteRepository = await this.getInstanceFileRepository(remoteInstance);

        const finalEvents = await promiseMap(events, async event => {
            const dataValues = await promiseMap(event.dataValues, async dataValue => {
                const isFileType = dataElementFileTypes.includes(dataValue.dataElement);

                if (isFileType) {
                    const file = await eventsRepository.getEventFile(event.id, dataValue.dataElement, dataValue.value);

                    const destinationFileId = await fileRemoteRepository.save(file, "DATA_VALUE");
                    return { ...dataValue, value: destinationFileId };
                } else {
                    return dataValue;
                }
            });

            return { ...event, dataValues };
        });

        return finalEvents;
    }
}
