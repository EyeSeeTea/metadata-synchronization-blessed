import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationBuilder } from "../../synchronization/entities/SynchronizationBuilder";

import { cache } from "../../../utils/cache";
import { Program } from "../../metadata/entities/MetadataEntities";
import { generateUid } from "../../common/entities/uid";
import { DataStoreMetadata } from "../../data-store/DataStoreMetadata";
import _ from "lodash";
import { ProgramEvent } from "../entities/ProgramEvent";
import { TrackedEntityInstance } from "../../tracked-entity-instances/entities/TrackedEntityInstance";
import { eventsFields } from "../usecases/EventsSyncUseCase";
import { Ref } from "../../common/entities/Ref";
import { TEIRepository } from "../../tracked-entity-instances/repositories/TEIRepository";
import { EventsPayload } from "../entities/EventsPayload";

export class EventsPayloadBuilder {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async build(syncBuilder: SynchronizationBuilder): Promise<EventsPayload> {
        const { dataParams = {}, excludedIds = [], originInstance: originInstanceId, metadataIds } = syncBuilder;
        const { enableAggregation = false, excludeEventCoordinates = false } = dataParams;
        const eventsRepository = await this.getEventsRepository(originInstanceId);
        const aggregatedRepository = await this.getAggregatedRepository(originInstanceId);
        const teisRepository = await this.getTeisRepository(originInstanceId);

        const {
            programs = [],
            programIndicators = [],
            programStages = [],
        } = await this.extractMetadata(this.localInstance, metadataIds);

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

        const trackedEntityInstances = await this.buildTrackedEntityInstances(
            teisRepository,
            dataParams,
            trackerProgramIds,
            events
        );

        const directIndicators = programIndicators.map(({ id }) => id);
        const indicatorsByProgram = _.flatten(
            programs?.map(({ programIndicators }) => programIndicators?.map(({ id }) => id) ?? [])
        );

        // Due to a limitation in the analytics endpoint, it's not possible request with dx dimension by program stage and data element
        // only program and data element is allowed. For this reason to avoid duplicate dimension error, we remove data element duplicated
        // using the uniq function. Duplicate data elements is possible for tracker programs here if two stages has the same data element
        // Jira-issue: https://jira.dhis2.org/browse/DHIS2-12382

        const dataElementsByProgram = _(programs)
            .flatMap(({ id, programStages }) =>
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
                  includeCategories: true,
              })
            : {};

        const dataValues = _.reject(candidateDataValues, ({ dataElement }) => excludedIds.includes(dataElement));

        return { events, dataValues, trackedEntities: trackedEntityInstances };
    }

    private async buildTrackedEntityInstances(
        teisRepository: TEIRepository,
        dataParams: SynchronizationBuilder["dataParams"],
        trackerProgramIds: string[],
        events: ProgramEvent[]
    ): Promise<TrackedEntityInstance[]> {
        const trackedEntityInstances =
            dataParams?.allTEIs && trackerProgramIds.length > 0
                ? await teisRepository.getAllTEIs(dataParams, trackerProgramIds)
                : dataParams?.teis
                ? await teisRepository.getTEIsById(dataParams, dataParams.teis)
                : [];

        if (!dataParams?.allTEIs) {
            return trackedEntityInstances;
        }
        // if allTEIs is true, get TEIs referenced by events but not included because of filters
        // i.e. TEIs not included in the filtered period, but referenced by events from that period
        const trackedEntityInstancesMissingIds = _(events)
            .flatMap(event => event.trackedEntity)
            .filter(teiId => Boolean(teiId) && !trackedEntityInstances.some(tei => tei.trackedEntity === teiId))
            .uniq()
            .value() as string[];
        if (trackedEntityInstancesMissingIds.length === 0) {
            return trackedEntityInstances;
        }
        const trackedEntityInstancesMissing = await teisRepository.getTEIsById(
            dataParams,
            trackedEntityInstancesMissingIds
        );
        return [...trackedEntityInstances, ...trackedEntityInstancesMissing];
    }

    @cache()
    protected async getEventsRepository(originInstanceId: string) {
        const originInstance = await this.getOriginInstance(originInstanceId);
        return this.repositoryFactory.eventsRepository(originInstance);
    }

    @cache()
    protected async getAggregatedRepository(originInstanceId: string) {
        const originInstance = await this.getOriginInstance(originInstanceId);
        return this.repositoryFactory.aggregatedRepository(originInstance);
    }

    @cache()
    protected async getTeisRepository(originInstanceId: string) {
        const originInstance = await this.getOriginInstance(originInstanceId);
        return this.repositoryFactory.teisRepository(originInstance);
    }

    @cache()
    public async extractMetadata<T>(instance: Instance, metadataIds: string[]) {
        const onlyMetadataIds = metadataIds.filter(id => !DataStoreMetadata.isDataStoreId(id));
        const cleanIds = onlyMetadataIds.map(id => _.last(id.split("-")) ?? id);
        const metadataRepository = await this.getMetadataRepository(instance);
        return metadataRepository.getMetadataByIds<T>(cleanIds, eventsFields) as Promise<EventsMetadataExtracted>;
    }

    @cache()
    protected async getMetadataRepository(instance: Instance) {
        return this.repositoryFactory.metadataRepository(instance);
    }

    @cache()
    public async getOriginInstance(originInstanceId: string): Promise<Instance> {
        const instance = await this.repositoryFactory.instanceRepository(this.localInstance).getById(originInstanceId);

        if (!instance) throw new Error("Unable to read origin instance");
        return instance;
    }
}

// TODO: remove this workaround for typing extractMetadata result
// the underlying issue is in the getMetadataByIds typings
type EventsMetadataExtracted = {
    programs?: Pick<Program, "id" | "programType" | "programStages" | "programIndicators">[];
    programIndicators?: Ref[];
    programStages?: Ref[];
};
