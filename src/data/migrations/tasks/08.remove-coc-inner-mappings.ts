import _ from "lodash";
import { MigrationParams } from ".";
import { Instance } from "../../../domain/instance/entities/Instance";
import { MetadataMappingDictionary } from "../../../domain/mapping/entities/MetadataMapping";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Migration } from "../client/types";

interface InstanceDetails {
    metadataMapping: MetadataMappingDictionary;
    username?: string;
    password?: string;
}

export async function migrate(storage: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const instances = (await storage.get<Instance[]>("instances")) ?? [];

    await promiseMap(instances, async instance => {
        const oldInstanceDetails = await storage.get<InstanceDetails>("instances-" + instance.id);

        if (
            oldInstanceDetails?.metadataMapping?.programDataElements ||
            oldInstanceDetails?.metadataMapping?.aggregatedDataElements
        ) {
            const oldProgramDataElements = oldInstanceDetails.metadataMapping.programDataElements;

            const programDataElements = oldProgramDataElements
                ? Object.keys(oldProgramDataElements).reduce((previous, key) => {
                      return {
                          ...previous,
                          [key]: {
                              ...oldProgramDataElements[key],
                              mapping: _.omit(oldProgramDataElements[key].mapping, [
                                  "categoryCombos",
                                  "categoryOptions",
                                  "categoryOptionCombos",
                              ]),
                          },
                      };
                  }, {})
                : undefined;

            const oldAggregatedDataElements = oldInstanceDetails.metadataMapping.aggregatedDataElements;

            const aggregatedDataElements = oldAggregatedDataElements
                ? Object.keys(oldAggregatedDataElements).reduce((previous, key) => {
                      return {
                          ...previous,
                          [key]: {
                              ...oldAggregatedDataElements[key],
                              mapping: _.omit(oldAggregatedDataElements[key].mapping, ["categoryOptionCombos"]),
                          },
                      };
                  }, {})
                : undefined;

            const metadataMapping = {
                ...oldInstanceDetails.metadataMapping,
                programDataElements,
                aggregatedDataElements,
            };

            const newInstanceDatails = { ...oldInstanceDetails, metadataMapping };

            await storage.save("instances-" + instance.id, newInstanceDatails);
        }
    });
}

const migration: Migration<MigrationParams> = {
    name: "Remove categoryCombos, categoryOptions, categoryOptioncombo inner mapping from program data elements and categoryOptioncombo from aggregated data elements",
    migrate,
};

export default migration;
