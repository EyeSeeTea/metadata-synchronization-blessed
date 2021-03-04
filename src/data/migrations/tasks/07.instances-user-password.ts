import _ from "lodash";
import { MigrationParams } from ".";
import { Debug } from "../../../domain/migrations/entities/Debug";
import i18n from "../../../locales";
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
    debug: Debug,
    _params: MigrationParams
): Promise<void> {
    const oldInstances = (await storage.get<InstanceOld[]>("instances")) ?? [];
    const newInstances: InstanceNew[] = oldInstances.map(ins =>
        _.omit(ins, ["username", "password"])
    );

    //Delete wrong key from old migrations
    await storage.remove("instances-");

    await promiseMap(oldInstances, async oldInstance => {
        const oldInstanceDetails = await storage.get<InstanceDetailsOld>(
            "instances-" + oldInstance.id
        );

        const newInstanceDatails: Maybe<InstanceDetailsNew> = {
            metadataMapping: oldInstanceDetails ? oldInstanceDetails.metadataMapping : {},
            username: oldInstance.username,
            password: oldInstance.password,
        };

        await storage.save("instances-" + oldInstance.id, newInstanceDatails);
    });

    await storage.save("instances", newInstances);

    debug({
        message: i18n.t(
            "In this version exists share settings for instances. It's necessary configure it"
        ),
        level: "warning",
    });
}

const migration: Migration<MigrationParams> = {
    name: "Move username and password to instance details",
    migrate,
};

export default migration;
