import { MigrationParams } from ".";
import { Instance, InstanceData } from "../../../domain/instance/entities/Instance";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { ObjectSharing } from "../../../domain/storage/repositories/StorageClient";
import { promiseMap } from "../../../utils/common";
import { AppStorage, Migration } from "../client/types";
import { D2Route, mapArrayToRecord, slugify } from "../../instance/InstanceD2ApiRepository";
import { decrypt } from "../../../utils/crypto";
import { Namespace } from "../../storage/Namespaces";
import { getD2APiFromInstance, removeTrailingSlash } from "../../../utils/d2-utils";

type DataStoreInstance = { id: string };

export async function migrate(storage: AppStorage, _debug: Debug, { localInstance }: MigrationParams): Promise<void> {
    if (!localInstance) {
        throw new Error("localInstance is required");
    }

    const encryptionKey = await getEncryptionKey();

    const instances = await getInstancesWithSharing(storage, encryptionKey);

    const d2api = getD2APiFromInstance(localInstance);

    await promiseMap(instances, async instance => {
        const route = buildRoute(instance);

        await d2api.post("/routes", {}, route).getData();

        const key = `${Namespace.INSTANCES}-${instance.id}`;

        await storage.remove(key);
    });

    await storage.remove(`${Namespace.INSTANCES}-LOCAL`);

    const dataStoreInstances = instances.map(instance => ({ id: instance.id }));

    await storage.save<DataStoreInstance[]>(Namespace.INSTANCES, dataStoreInstances);
}

const migration: Migration<MigrationParams> = {
    name: "Migrate instances from data store to routes",
    migrate,
};

export default migration;

async function getEncryptionKey(): Promise<string> {
    const appConfig = await fetch("app-config.json", {
        credentials: "same-origin",
    }).then(res => res.json());

    const encryptionKey = appConfig?.encryptionKey;
    if (!encryptionKey) throw new Error("You need to provide a valid encryption key");

    return encryptionKey;
}

async function getInstancesWithSharing(storage: AppStorage, encryptionKey: string) {
    const dataStoreBaseInstances = await storage.get<InstanceData[]>(Namespace.INSTANCES);

    if (!dataStoreBaseInstances) {
        return [];
    }

    const dataStoreInstances = dataStoreBaseInstances.filter(instance => instance.id !== "LOCAL");

    const instances = await promiseMap(dataStoreInstances, async instance => {
        const sharing = await getObjectSharingOrError(storage, instance.id);
        const advancedProps = await storage.get<{ username?: string; password?: string }>(
            `${Namespace.INSTANCES}-${instance.id}`
        );

        const decryptPassword = (password?: string) => {
            return password ? decrypt(password, encryptionKey) : "";
        };

        const mapToInstance = async (instanceData: InstanceData, sharing: ObjectSharing | undefined) =>
            Instance.build({
                ...instanceData,
                url: instanceData.url,
                version: instanceData.version,
                username: advancedProps?.username,
                password: await decryptPassword(advancedProps?.password),
                ...(sharing ?? {
                    publicAccess: "--------",
                    userAccesses: [],
                    userGroupAccesses: [],
                    user: {
                        id: "",
                        name: "",
                    },
                    externalAccess: false,
                }),
            });

        return mapToInstance(instance, sharing);
    });

    return instances;
}

async function getObjectSharingOrError(storage: AppStorage, id: string): Promise<ObjectSharing | undefined> {
    try {
        const key = `${Namespace.INSTANCES}-${id}`;

        const sharing = await storage.getObjectSharing(key);

        return sharing;
    } catch (error: any) {
        return undefined;
    }
}

function buildRoute(instance: Instance): D2Route {
    const url = removeTrailingSlash(instance.url);

    return {
        auth:
            instance.authType === "api-token"
                ? { type: "api-token", token: instance.token }
                : { type: "http-basic", username: instance.username, password: instance.password },
        code: slugify(instance.name),
        description: instance.description,
        disabled: false,
        displayName: instance.name,
        headers: { "Content-Type": "application/json" },
        id: instance.id,
        name: instance.name,
        sharing: {
            external: false,
            owner: instance.user.id,
            public: instance.publicAccess,
            users: mapArrayToRecord(instance.userAccesses),
            userGroups: mapArrayToRecord(instance.userGroupAccesses),
        },
        url: `${url}/**`,
    };
}
