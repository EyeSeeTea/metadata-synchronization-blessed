import { generateUid } from "d2/uid";
import _ from "lodash";
import memoize from "nano-memoize";
import { eventsTransformationsToDhis2 } from "../../../data/transformations/PackageTransformations";
import { D2Program } from "../../../types/d2-api";
import {
    mapCategoryOptionCombo,
    mapOptionValue,
    mapProgramDataElement,
} from "../../../utils/synchronization";
import { DataValue } from "../../aggregated/entities/DataValue";
import { AggregatedSyncUseCase } from "../../aggregated/usecases/AggregatedSyncUseCase";
import { Instance } from "../../instance/entities/Instance";
import { MetadataMappingDictionary } from "../../instance/entities/MetadataMapping";
import { CategoryOptionCombo } from "../../metadata/entities/MetadataEntities";
import { SynchronizationResult } from "../../synchronization/entities/SynchronizationResult";
import {
    GenericSyncUseCase,
    SyncronizationPayload,
} from "../../synchronization/usecases/GenericSyncUseCase";
import { buildMetadataDictionary, cleanOrgUnitPath } from "../../synchronization/utils";
import { EventsPackage } from "../entities/EventsPackage";
import { ProgramEvent } from "../entities/ProgramEvent";
import { ProgramEventDataValue } from "../entities/ProgramEventDataValue";

export class EventsSyncUseCase extends GenericSyncUseCase {
    public readonly type = "events";
    public readonly fields =
        "id,name,programStages[programStageDataElements[dataElement[id,displayFormName,name]]],programIndicators[id,name]";

    public buildPayload = memoize(async () => {
        const { dataParams = {}, excludedIds = [] } = this.builder;
        const { enableAggregation = false } = dataParams;
        const eventsRepository = await this.getEventsRepository();
        const aggregatedRepository = await this.getAggregatedRepository();

        const { programs = [], programIndicators = [] } = await this.extractMetadata();

        const events = (
            await eventsRepository.getEvents(
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
            ? await aggregatedRepository.getAnalytics({
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

    private async postEventsPayload(
        instance: Instance,
        events: ProgramEvent[]
    ): Promise<SynchronizationResult> {
        const { dataParams = {} } = this.builder;

        const payload = await this.mapPayload(instance, { events });

        if (!instance.apiVersion) {
            throw new Error(
                "Necessary api version of receiver instance to apply transformations to package is undefined"
            );
        }

        const versionedPayloadPackage = this.getTransformationRepository().mapPackageTo(
            instance.apiVersion,
            payload,
            eventsTransformationsToDhis2
        );
        console.debug("Events package", { events, payload, versionedPayloadPackage });

        const eventsRepository = await this.getEventsRepository(instance);
        const syncResult = await eventsRepository.save(payload, dataParams);
        const origin = await this.getOriginInstance();

        return { ...syncResult, origin: origin.toPublicObject() };
    }

    private async postIndicatorPayload(
        instance: Instance,
        dataValues: DataValue[]
    ): Promise<SynchronizationResult | undefined> {
        const { dataParams = {} } = this.builder;
        const { enableAggregation } = dataParams;
        if (!enableAggregation) return undefined;

        // TODO: This is an external action and should be called by user
        const aggregatedSync = new AggregatedSyncUseCase(
            this.builder,
            this.repositoryFactory,
            this.localInstance,
            this.encryptionKey
        );
        const payload = await aggregatedSync.mapPayload(instance, { dataValues });
        console.debug("Program indicator package", { dataValues, payload });

        const aggregatedRepository = await this.getAggregatedRepository(instance);
        const syncResult = await aggregatedRepository.save(payload, dataParams);
        const origin = await this.getOriginInstance();

        return { ...syncResult, origin: origin.toPublicObject() };
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
        const instanceRepository = await this.getInstanceRepository();
        const remoteInstanceRepository = await this.getInstanceRepository(instance);

        const originCategoryOptionCombos = await instanceRepository.getCategoryOptionCombos();
        const destinationCategoryOptionCombos = await remoteInstanceRepository.getCategoryOptionCombos();
        const defaultCategoryOptionCombos = await instanceRepository.getDefaultIds(
            "categoryOptionCombos"
        );

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
        originCategoryOptionCombos: Partial<CategoryOptionCombo>[],
        destinationCategoryOptionCombos: Partial<CategoryOptionCombo>[],
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
