import _ from "lodash";
import memoize from "nano-memoize";
import Instance from "../../models/instance";
import { DataImportResponse } from "../../types/d2";
import { EventsPackage } from "../../types/synchronization";
import {
    buildMetadataDictionary,
    cleanDataImportResponse,
    getEventsData,
    postEventsData,
    cleanOrgUnitPath,
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
                orgUnits: _.uniq(array.map(({ orgUnitName }) => orgUnitName)),
            }))
            .values()
            .value();
    }

    protected async mapMetadata(
        instance: Instance,
        payload: EventsPackage
    ): Promise<SyncronizationPayload> {
        const {
            organisationUnits = {},
            dataElements = {},
            programs = {},
            programStages = {},
        } = instance.metadataMapping;
        const { events: oldEvents } = payload;

        const events = oldEvents.map(
            ({ orgUnit, orgUnitName, program, programStage, dataValues, ...rest }) => {
                const mappedOrgUnit = organisationUnits[orgUnit]?.mappedId ?? orgUnit;
                const mappedProgram = programs[program]?.mappedId ?? program;
                const mappedProgramStage = programStages[programStage]?.mappedId ?? programStage;

                return {
                    orgUnit: cleanOrgUnitPath(mappedOrgUnit),
                    program: mappedProgram,
                    programStage: mappedProgramStage,
                    dataValues: dataValues.map(({ dataElement, ...rest }) => {
                        const mappedDataElement =
                            dataElements[dataElement]?.mappedId ?? dataElement;

                        return {
                            dataElement: mappedDataElement,
                            ...rest,
                        };
                    }),
                    ...rest,
                };
            }
        );

        return { events };
    }
}
