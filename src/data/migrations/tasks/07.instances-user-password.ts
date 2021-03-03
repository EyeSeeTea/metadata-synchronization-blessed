import debug from "debug";
import _ from "lodash";
import { MigrationParams } from ".";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { Maybe } from "../../../types/utils";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Migration } from "../client/types";

interface InstanceOld {
    id: string;
    name: string;
    url: string;
    username?: string;
    password?: string;
    description?: string;
    version?: string;
    metadataMapping?: MetadataMappingDictionary;
    type: "local" | "dhis";
}

interface InstanceDetailsOld {
    metadataMapping: MetadataMappingDictionary;
}

interface MetadataMappingDictionary {
    [model: string]: unknown;
}

type InstanceNew = Omit<InstanceOld, "username" | "password">;

interface InstanceDetailsNew {
    metadataMapping: MetadataMappingDictionary;
    username?: string;
    password?: string;
}

export async function migrate(
    storage: AppStorage,
    _debug: Debug,
    _params: MigrationParams
): Promise<void> {
    const oldInstances = (await storage.get<InstanceOld[]>("instances")) ?? [];
    const newInstances: InstanceNew[] = oldInstances.map(ins =>
        _.omit(ins, ["username", "password"])
    );

    await promiseMap(oldInstances, async oldInstance => {
        const oldInstanceDetails = await storage.get<InstanceDetailsOld>(
            "instances-" + oldInstance.id
        );

        if (!oldInstanceDetails) debug(`Detail key for instance ${oldInstance.id} does not exist`);

        const newInstanceDatails: Maybe<InstanceDetailsNew> = {
            metadataMapping: oldInstanceDetails ? oldInstanceDetails.metadataMapping : {},
            username: oldInstance.username,
            password: oldInstance.password,
        };
        debug(`Create details entry for instance ${oldInstance.id}`);
        await storage.save("instances-" + oldInstance.id, newInstanceDatails);
    });

    debug(`Save main instances object`);
    await storage.save("instances", newInstances);
}

const migration: Migration<MigrationParams> = {
    name: "Move instance username and password to detail",
    migrate,
};

export default migration;
