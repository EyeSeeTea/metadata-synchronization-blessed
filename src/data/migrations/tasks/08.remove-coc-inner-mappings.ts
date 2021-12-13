import _ from "lodash";
import { MigrationParams } from ".";
import { Instance } from "../../../domain/instance/entities/Instance";
import { MetadataMapping, MetadataMappingDictionary } from "../../../domain/mapping/entities/MetadataMapping";
import { MetadataPackage } from "../../../domain/metadata/entities/MetadataEntities";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { D2Api } from "../../../types/d2-api";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Migration } from "../client/types";

interface InstanceDetails {
    metadataMapping: MetadataMappingDictionary;
    username?: string;
    password?: string;
}

function cleanProgramDataElements(oldProgramDataElements: { [id: string]: MetadataMapping }) {
    return oldProgramDataElements
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
}

async function cleanAggregatedDataElements(d2Api: D2Api, oldAggregatedItems: { [id: string]: MetadataMapping }) {
    // aggregatedDataElements mappping key can contain dataElements, indicators and programIndicators
    // We only need remove categoryOptionCombos from the inner mapping for data elements
    const aggregatedMetadata = await d2Api
        .get<MetadataPackage>("/metadata", {
            fields: "id",
            filter: "id:in:[" + Object.keys(oldAggregatedItems) + "]",
        })
        .getData();

    return oldAggregatedItems
        ? Object.keys(oldAggregatedItems).reduce((previous, key) => {
              const isDataElement = aggregatedMetadata.dataElements?.some(de => de.id === key);

              return {
                  ...previous,
                  [key]: {
                      ...oldAggregatedItems[key],
                      mapping: isDataElement
                          ? _.omit(oldAggregatedItems[key].mapping, ["categoryOptionCombos"])
                          : oldAggregatedItems[key].mapping,
                  },
              };
          }, {})
        : undefined;
}

export async function migrate(storage: AppStorage, _debug: Debug, params: MigrationParams): Promise<void> {
    const instances = (await storage.get<Instance[]>("instances")) ?? [];

    await promiseMap(instances, async instance => {
        const oldInstanceDetails = await storage.get<InstanceDetails>("instances-" + instance.id);
        const oldMetadataMapping = oldInstanceDetails?.metadataMapping;

        const { d2Api } = params;

        if (!d2Api) {
            throw Error("D2Api as param is mandatory to execute this migration");
        }

        if (oldMetadataMapping?.programDataElements || oldMetadataMapping?.aggregatedDataElements) {
            const programDataElements = cleanProgramDataElements(oldMetadataMapping.programDataElements);

            const aggregatedDataElements = oldMetadataMapping.aggregatedDataElements ? await cleanAggregatedDataElements(
                d2Api,
                oldMetadataMapping.aggregatedDataElements
            ) : undefined;

            const metadataMapping = {
                ...oldMetadataMapping,
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
