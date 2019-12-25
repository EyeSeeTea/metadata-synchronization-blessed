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
} from "../../utils/synchronization";
import { GenericSync } from "./generic";

export class EventsSync extends GenericSync {
    protected readonly type = "events";

    protected buildPayload = memoize(async () => {
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

        return postEventsData(instance, payloadPackage, dataParams);
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
}
