import _ from "lodash";
import { MigrationParams } from ".";
import { Debug } from "../../../domain/migrations/entities/Debug";
import i18n from "../../../locales";
import { D2Api } from "../../../types/d2-api";
import { Maybe } from "../../../types/utils";
import { promiseMap } from "../../../utils/common";
import { dataStoreNamespace } from "../../storage/StorageDataStoreClient";
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

export async function migrate(storage: AppStorage, debug: Debug, params: MigrationParams): Promise<void> {
    const oldInstances = (await storage.get<InstanceOld[]>("instances")) ?? [];
    const newInstances: InstanceNew[] = oldInstances.map(ins => _.omit(ins, ["username", "password"]));
    const { d2Api } = params;

    //Delete wrong key from old migrations
    await storage.remove("instances-");

    await promiseMap(oldInstances, async oldInstance => {
        const oldInstanceDetails = await storage.get<InstanceDetailsOld>("instances-" + oldInstance.id);

        const newInstanceDatails: Maybe<InstanceDetailsNew> = {
            metadataMapping: oldInstanceDetails ? oldInstanceDetails.metadataMapping : {},
            username: oldInstance.username,
            password: oldInstance.password,
        };

        await storage.save("instances-" + oldInstance.id, newInstanceDatails);

        if (d2Api) {
            modifyAccessToInstance(d2Api, `instances-${oldInstance.id}`);
        }
    });

    await storage.save("instances", newInstances);

    debug({
        message: i18n.t(
            "THIS NEW RELEASE INCLUDES SHARING SETTINGS PER INSTANCES. FOR THIS VERSION TO WORK PROPERLY, YOU WILL HAVE TO SET THE SHARING SETTINGS FOR EACH INSTANCE (Menu 'Instance Settings' > Contextual action 'Sharing settings')"
        ),
        level: "warning",
    });
}

const migration: Migration<MigrationParams> = {
    name: "Move username and password to instance details",
    migrate,
};

async function modifyAccessToInstance(api: D2Api, key: string): Promise<void> {
    const { id, user } = await getMetadataByKey(api, key);

    const object = {
        publicAccess: key === "instances-LOCAL" ? "rw------" : "--------",
        externalAccess: false,
        user,
        userAccesses: [],
        userGroupAccesses: [],
    };

    await api.sharing.post({ type: "dataStore", id }, object).getData();
}

async function getMetadataByKey(api: D2Api, key: string) {
    const data = await api.dataStore(dataStoreNamespace).getMetadata(key).getData();
    if (!data) throw new Error(`Invalid dataStore key ${key}`);

    return data;
}

export default migration;
