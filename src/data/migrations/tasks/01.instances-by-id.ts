import debug from "debug";
import _ from "lodash";
import { MigrationParams } from ".";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { Maybe } from "../../../types/utils";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Migration } from "../client/types";
import { getDuplicatedIds } from "../client/utils";

interface InstanceOld {
    id: string;
    name: string;
    url: string;
    username: string;
    password: string;
    description?: string;
    metadataMapping?: MetadataMappingDictionary;
}

interface MetadataMappingDictionary {
    [model: string]: unknown;
}

type InstanceNew = Omit<InstanceOld, "metadataMapping">;

interface InstanceDetailsNew {
    metadataMapping: MetadataMappingDictionary;
}

export async function migrate(storage: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const oldInstances = (await storage.get<InstanceOld[]>("instances")) ?? [];
    const newInstances: InstanceNew[] = oldInstances.map(ins => _.omit(ins, ["metadataMapping"]));
    const duplicatedIds = getDuplicatedIds(oldInstances);
    const uniqueOldInstances = _.uniqBy(oldInstances, instance => instance.id);

    if (duplicatedIds.length > 0) debug(`[instances] Duplicate ids: ${duplicatedIds.join(", ")}`);

    await promiseMap(uniqueOldInstances, async oldInstance => {
        const newInstanceDatails: Maybe<InstanceDetailsNew> = {
            metadataMapping: oldInstance.metadataMapping || {},
        };
        debug(`Create details entry for instance ${oldInstance.id}`);
        await storage.save("instances-" + oldInstance.id, newInstanceDatails);
    });

    debug(`Save main instances object`);
    await storage.save("instances", newInstances);
}

const migration: Migration<MigrationParams> = { name: "Update instance ids", migrate };

export default migration;
