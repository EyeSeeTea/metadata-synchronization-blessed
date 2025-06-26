import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationBuilder } from "../../synchronization/entities/SynchronizationBuilder";

import { D2Program } from "../../../types/d2-api";
import { cache } from "../../../utils/cache";
import { Program } from "../../metadata/entities/MetadataEntities";
import { generateUid } from "../../common/entities/uid";
import { DataStoreMetadata } from "../../data-store/DataStoreMetadata";
import _ from "lodash";
import { ProgramEvent } from "../entities/ProgramEvent";
import { DataValue } from "../../aggregated/entities/DataValue";
import { TrackedEntityInstance } from "../../tracked-entity-instances/entities/TrackedEntityInstance";
import { eventsFields } from "../usecases/EventsSyncUseCase";

type EventsPayload = {
    events: ProgramEvent[];
    dataValues: DataValue[];
    trackedEntityInstances: TrackedEntityInstance[];
};

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
        return metadataRepository.getMetadataByIds<T>(cleanIds, eventsFields);
    }

    @cache()
    protected async getMetadataRepository(instance: Instance) {
        return this.repositoryFactory.metadataRepository(instance);
    }

    @cache()
    public async getOriginInstance(originInstanceId: string): Promise<Instance> {
        const instance = await this.getInstanceById(originInstanceId);

        if (!instance) throw new Error("Unable to read origin instance");
        return instance;
    }

    private async getInstanceById(id: string): Promise<Instance | undefined> {
        const instance = await this.repositoryFactory.instanceRepository(this.localInstance).getById(id);
        if (!instance) return undefined;

        try {
            const version = await this.repositoryFactory.instanceRepository(instance).getVersion();
            return instance.update({ version });
        } catch (error: any) {
            return instance;
        }
    }
}
