//import Cryptr from "cryptr";
import _ from "lodash";
import { ExchangeTargetType, Instance, InstanceType } from "../../domain/instance/entities/Instance";
import { InstanceMessage } from "../../domain/instance/entities/Message";
import { InstanceRepository, InstancesFilter } from "../../domain/instance/repositories/InstanceRepository";
import { D2Api, D2User } from "../../types/d2-api";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance, removeTrailingSlash } from "../../utils/d2-utils";
import { InmemoryCache } from "../common/InmemoryCache";
import { Id } from "../../domain/common/entities/Schemas";
import { SharingSetting } from "../../domain/common/entities/SharingSetting";
import { StorageClientFactory } from "../config/StorageClientFactory";
import { Namespace } from "../storage/Namespaces";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
export class InstanceD2ApiRepository implements InstanceRepository {
    private api: D2Api;
    private cache = new InmemoryCache();

    constructor(private instance: Instance, private storageClientFactory: StorageClientFactory) {
        this.api = getD2APiFromInstance(instance);
    }

    async getAll({ search, ids, types }: InstancesFilter): Promise<Instance[]> {
        const objects = await this.getInstances();

        const filteredDataBySearch = search
            ? _.filter(objects, o =>
                  _(o)
                      .values()
                      .some(value =>
                          typeof value === "string" ? value.toLowerCase().includes(search.toLowerCase()) : false
                      )
              )
            : objects;

        const filteredDataByIds = filteredDataBySearch.filter(instanceData => !ids || ids.includes(instanceData.id));

        const filteredDataByType = filteredDataByIds.filter(
            instanceData => !types || types.includes(instanceData.type)
        );

        return filteredDataByType;
    }

    async getById(id: string): Promise<Instance | undefined> {
        const existingInstances = await this.getInstances();

        const instance = existingInstances?.find(instance => instance.id === id);

        return instance;
    }

    async save(instance: Instance): Promise<void> {
        await this.saveInstanceInDataStore(instance);

        if (instance.type === "dhis") {
            await this.saveRoute(instance);
        }

        this.cache.clear();
    }

    async delete(id: string): Promise<void> {
        await this.deleteInstanceFromDataStore(id);
        await this.deleteRoute(id);
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.storageClientFactory.getStorageClientPromise();
    }

    private async saveInstanceInDataStore(instance: Instance) {
        const storageClient = await this.getStorageClient();

        const instanceData: InstanceDataStoreData =
            instance.type === "dhis"
                ? {
                      ..._.pick(instance.toObject(), "id"),
                  }
                : {
                      ..._.pick(instance.toObject(), "id", "name", "type", "url", "description", "exchangeTargetType"),
                  };

        await storageClient.saveObjectInCollection(Namespace.INSTANCES, instanceData);
    }

    private async saveRoute(instance: Instance) {
        const routeToUpload = this.buildRoute(instance);

        const existedRoute = await this.getById(instance.id);

        if (existedRoute) {
            await this.api.put(`/routes/${existedRoute.id}`, {}, routeToUpload).getData();
        } else {
            await this.api.post("/routes", {}, routeToUpload).getData();
        }
    }

    private async deleteInstanceFromDataStore(id: string) {
        const storageClient = await this.getStorageClient();

        await storageClient.removeObjectInCollection(Namespace.INSTANCES, id);
    }

    private async deleteRoute(id: string) {
        this.cache.clear();
        await this.api.delete(`/routes/${id}`, {}).getData();
    }

    private buildRoute(instance: Instance): D2Route {
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

    private buildInstance(route: D2Route): Instance {
        return Instance.build({
            type: "dhis",
            id: route.id,
            name: route.name,
            url: removeTrailingSlash(route.url.replace("**", "")),
            authType: route.auth?.type,
            token: route.auth?.token,
            username: route.auth?.username,
            password: route.auth?.password,
            description: route.description,
            publicAccess: route.sharing.public,
            userAccesses: Object.values(route.sharing.users),
            userGroupAccesses: Object.values(route.sharing.userGroups),
            user: route.user,
            created: new Date(route.created || ""),
            lastUpdated: new Date(route.lastUpdated || ""),
            lastUpdatedBy: route.lastUpdatedBy,
        });
    }

    private async getInstances(): Promise<Instance[]> {
        const instances = await this.cache.getOrPromise("instances", async () => {
            const storageClient = await this.getStorageClient();
            const dataStoreInstances = await storageClient.listObjectsInCollection<InstanceDataStoreData>(
                Namespace.INSTANCES
            );

            const response = await this.api
                .get<{ routes: D2Route[] }>("/routes", {
                    paging: false,
                    fields: "*",
                })
                .getData();

            const routeInstances = response.routes.map(this.buildInstance);

            const routeInstancesWithVersion = await promiseMap(routeInstances, async targetInstance => {
                const d2ApiByInstance = getD2APiFromInstance(this.instance, targetInstance);

                const version = await d2ApiByInstance.system.info
                    .getData()
                    .then(data => data.version)
                    .catch(() => undefined);

                return targetInstance.update({ version });
            });

            const allInstances = dataStoreInstances
                .map(dataStoreInstance => {
                    if (dataStoreInstance.type === "aggregated-data-exchange") {
                        return Instance.build({
                            id: dataStoreInstance.id,
                            name: dataStoreInstance.name || "",
                            type: dataStoreInstance.type,
                            url: dataStoreInstance.url || "",
                            description: dataStoreInstance.description || "",
                            exchangeTargetType: dataStoreInstance.exchangeTargetType ?? "external",
                        });
                    } else {
                        const instance = routeInstancesWithVersion.find(
                            instance => instance.id === dataStoreInstance.id
                        );

                        return instance;
                    }
                })
                .filter((instance): instance is Instance => instance !== undefined);

            return [this.instance, ...allInstances];
        });

        return instances;
    }

    //TODO: this should not be here, may be a message repository?
    public async sendMessage(message: InstanceMessage): Promise<void> {
        //@ts-ignore https://github.com/EyeSeeTea/d2-api/pull/52
        await this.api.messageConversations.post(message).getData();
    }
}

export type D2Route = {
    auth?: RouteAuth;
    authorities?: string[];
    code: Id;
    created?: string;
    createdBy?: D2User;
    description: string;
    disabled: boolean;
    displayName: string;
    favorite?: boolean;
    headers: Record<string, string>;
    href?: string;
    id: Id;
    lastUpdated?: string;
    lastUpdatedBy?: D2User;
    name: string;
    sharing: D2ObjectSharing;
    url: string;
    user?: D2User;
};

export interface D2ObjectSharing {
    owner: string;
    external: boolean;
    users: Record<string, SharingSetting>;
    userGroups: Record<string, SharingSetting>;
    public: string;
}
export interface D2Sharing {
    access: string;
    displayName: string;
    id: string;
    name?: string;
}

type RouteAuth = {
    type: "http-basic" | "api-token";
    username?: string;
    password?: string;
    token?: string;
};

export function slugify(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export function mapArrayToRecord(array: SharingSetting[]): Record<string, SharingSetting> {
    return array.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {} as Record<string, SharingSetting>);
}

export interface InstanceDataStoreData {
    type?: InstanceType;
    id: string;
    name?: string;
    url?: string;
    description?: string;
    exchangeTargetType?: ExchangeTargetType;
}
