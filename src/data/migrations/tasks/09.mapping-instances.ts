import { generateUid } from "d2/uid";
import { MigrationParams } from ".";
import { InstanceData } from "../../../domain/instance/entities/Instance";
import { MappingOwner } from "../../../domain/mapping/entities/MappingOwner";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { Maybe } from "../../../types/utils";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Migration } from "../client/types";

interface InstanceDetailsOld {
    username?: string;
    password?: string;
    metadataMapping: MetadataMappingDictionary;
}

interface MetadataMappingDictionary {
    [model: string]: unknown;
}

interface InstanceDetailsNew {
    username?: string;
    password?: string;
}

interface DataSourceMapping {
    id: string;
    owner: MappingOwner;
}

interface DataSourceMappingDetails {
    mappingDictionary: MetadataMappingDictionary;
}

export async function migrate(storage: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const oldInstances = (await storage.get<InstanceData[]>("instances")) ?? [];

    await promiseMap(oldInstances, async oldInstance => {
        const oldInstanceDetails = await storage.get<InstanceDetailsOld>("instances-" + oldInstance.id);

        if (oldInstanceDetails && oldInstanceDetails.metadataMapping) {
            const mappings = (await storage.get<DataSourceMapping[]>("mappings")) ?? [];

            const newMapping: DataSourceMapping = {
                id: generateUid(),
                owner: { type: "instance", id: oldInstance.id },
            };

            const newMappingDetails: DataSourceMappingDetails = {
                mappingDictionary: oldInstanceDetails.metadataMapping,
            };

            await storage.save("mappings-" + newMapping.id, newMappingDetails);
            await storage.save("mappings", [...mappings, newMapping]);

            const newInstanceDatails: Maybe<InstanceDetailsNew> = {
                username: oldInstanceDetails.username,
                password: oldInstanceDetails.password,
            };

            await storage.save("instances-" + oldInstance.id, newInstanceDatails);
        }
    });
}

const migration: Migration<MigrationParams> = {
    name: "Move mapping of the instances to mappings key",
    migrate,
};

export default migration;
