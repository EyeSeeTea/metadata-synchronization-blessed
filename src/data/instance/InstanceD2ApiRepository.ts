import Cryptr from "cryptr";
import _ from "lodash";
import { Either } from "../../domain/common/entities/Either";
import { Instance, InstanceData } from "../../domain/instance/entities/Instance";
import { InstanceMessage } from "../../domain/instance/entities/Message";
import { InstanceRepository, InstancesFilter } from "../../domain/instance/repositories/InstanceRepository";
import { OrganisationUnit } from "../../domain/metadata/entities/MetadataEntities";
import { ObjectSharing, StorageClient } from "../../domain/storage/repositories/StorageClient";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { InmemoryCache } from "../common/InmemoryCache";
import { Namespace } from "../storage/Namespaces";
import { StorageClientFactory } from "../config/StorageClientFactory";

type ObjectSharingError = "authority-error" | "unexpected-error";

export class InstanceD2ApiRepository implements InstanceRepository {
    private api: D2Api;
    private cache = new InmemoryCache();

    constructor(
        private storageClientFactory: StorageClientFactory,
        private instance: Instance,
        private encryptionKey: string
    ) {
        this.api = getD2APiFromInstance(instance);
    }

    async getAll({ search, ids }: InstancesFilter): Promise<Instance[]> {
        const objects = await this.getInstances(false);

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

        const instances = await promiseMap(filteredDataByIds, async data => {
            const sharingResult = await this.getObjectSharingOrError(data.id);

            const object = await this.getInstanceDataInColletion(data.id);

            return sharingResult.match({
                success: sharing => this.mapToInstance(object ?? data, sharing),
                error: () =>
                    this.mapToInstance(object ?? data, {
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
        });

        return _.compact(instances);
    }

    async getById(id: string): Promise<Instance | undefined> {
        const instanceData = await this.getInstanceDataInColletion(id);

        if (!instanceData) return undefined;

        const sharing = await this.getObjectSharing(instanceData.id);

        return this.mapToInstance(instanceData, sharing);
    }

    async getByName(name: string): Promise<Instance | undefined> {
        const existingInstances = await this.getInstances();

        const instanceData = existingInstances?.find(instance => instance.name === name);

        if (!instanceData) return undefined;

        const sharing = await this.getObjectSharing(instanceData.id);

        return this.mapToInstance(instanceData, sharing);
    }

    async save(instance: Instance): Promise<void> {
        this.cache.clear();

        const storageClient = await this.getStorageClient();

        const instanceData = {
            ..._.omit(
                instance.toObject(),
                "publicAccess",
                "userAccesses",
                "externalAccess",
                "userGroupAccesses",
                "user",
                "created",
                "lastUpdated",
                "lastUpdatedBy"
            ),
            url: instance.type === "local" ? "" : instance.url,
            password: this.encryptPassword(instance.password),
        };

        await storageClient.saveObjectInCollection(Namespace.INSTANCES, instanceData);

        const objectSharing = {
            publicAccess: instance.publicAccess,
            externalAccess: false,
            user: instance.user,
            userAccesses: instance.userAccesses,
            userGroupAccesses: instance.userGroupAccesses,
        };

        await storageClient.saveObjectSharing(`${Namespace.INSTANCES}-${instanceData.id}`, objectSharing);
    }

    private decryptPassword(password?: string): string {
        return password ? new Cryptr(this.encryptionKey).decrypt(password) : "";
    }

    private encryptPassword(password?: string): string {
        return password ? new Cryptr(this.encryptionKey).encrypt(password) : "";
    }

    private async getInstances(useCache = true) {
        const storageClient = await this.getStorageClient();

        if (useCache) {
            return await this.cache.getOrPromise(Namespace.INSTANCES, () =>
                storageClient.listObjectsInCollection<InstanceData>(Namespace.INSTANCES)
            );
        } else {
            return await storageClient.listObjectsInCollection<InstanceData>(Namespace.INSTANCES);
        }
    }

    private async getInstanceDataInColletion(id: string): Promise<InstanceData | undefined> {
        const storageClient = await this.getStorageClient();

        const instanceData = await this.cache.getOrPromise(`${Namespace.INSTANCES}-${id}`, () =>
            storageClient.getObjectInCollection<InstanceData>(Namespace.INSTANCES, id)
        );

        return instanceData;
    }

    private async getObjectSharingOrError(id: string): Promise<Either<ObjectSharingError, ObjectSharing>> {
        try {
            const objectSharing = await this.getObjectSharing(id);

            return objectSharing ? Either.success(objectSharing) : Either.error("unexpected-error");
        } catch (error: any) {
            if (error.response?.status === 403) {
                return Either.error("authority-error");
            } else {
                return Either.error("unexpected-error");
            }
        }
    }

    private async getObjectSharing(id: string) {
        const storageClient = await this.getStorageClient();

        const key = `${Namespace.INSTANCES}-${id}`;

        const sharing = await this.cache.getOrPromise(`sharing-${key}`, () => storageClient.getObjectSharing(key));

        return sharing;
    }

    public getApi(): D2Api {
        return this.api;
    }

    //TODO: this should not be here, callers should getInstanceById or current and get the version
    @cache()
    public async getVersion(): Promise<string> {
        const { version } = await this.api.system.info.getData();
        return version;
    }

    //TODO: this should not be here, callers should getInstanceById or current and get to the instance
    @cache()
    public getBaseUrl(): string {
        return this.api.baseUrl;
    }

    //TODO: this should nbe in a MetadataRepository
    @cache()
    public async getOrgUnitRoots(): Promise<Pick<OrganisationUnit, "id" | "name" | "displayName" | "path">[]> {
        const { objects } = await this.api.models.organisationUnits
            .get({
                paging: false,
                filter: { level: { eq: "1" } },
                fields: { id: true, name: true, displayName: true, path: true },
            })
            .getData();

        return objects;
    }

    //TODO: this should not be here, may be a message repository?
    public async sendMessage(message: InstanceMessage): Promise<void> {
        //@ts-ignore https://github.com/EyeSeeTea/d2-api/pull/52
        await this.api.messageConversations.post(message).getData();
    }

    private mapToInstance(data: InstanceData, sharing: ObjectSharing | undefined) {
        return Instance.build({
            ...data,
            url: data.type === "local" ? this.instance.url : data.url,
            version: data.type === "local" ? this.instance.version : data.version,
            username: data.type === "local" ? this.instance.username : data.username,
            password: data.type === "local" ? this.instance.password : this.decryptPassword(data.password),
            ...sharing,
        });
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.storageClientFactory.getStorageClientPromise();
    }
}
