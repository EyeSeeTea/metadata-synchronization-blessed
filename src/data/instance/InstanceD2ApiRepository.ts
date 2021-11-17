import Cryptr from "cryptr";
import _ from "lodash";
import { Either } from "../../domain/common/entities/Either";
import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { Instance, InstanceData } from "../../domain/instance/entities/Instance";
import { InstanceMessage } from "../../domain/instance/entities/Message";
import { InstanceRepository, InstancesFilter } from "../../domain/instance/repositories/InstanceRepository";
import { OrganisationUnit } from "../../domain/metadata/entities/MetadataEntities";
import { ObjectSharing, StorageClient } from "../../domain/storage/repositories/StorageClient";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { Namespace } from "../storage/Namespaces";

type ObjectSharingError = "authority-error" | "unexpected-error";

export class InstanceD2ApiRepository implements InstanceRepository {
    private api: D2Api;

    constructor(private configRepository: ConfigRepository, private instance: Instance, private encryptionKey: string) {
        this.api = getD2APiFromInstance(instance);
    }

    async getAll({ search, ids }: InstancesFilter): Promise<Instance[]> {
        const storageClient = await this.getStorageClient();

        const objects = await storageClient.listObjectsInCollection<InstanceData>(Namespace.INSTANCES);

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
            const sharingResult = await this.getObjectSharing(storageClient, data);
            const object = await storageClient.getObjectInCollection<InstanceData>(Namespace.INSTANCES, data.id);

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

        const storageClient = await this.getStorageClient();
        const sharing = await storageClient.getObjectSharing(`${Namespace.INSTANCES}-${instanceData.id}`);

        return this.mapToInstance(instanceData, sharing);
    }

    async getByName(name: string): Promise<Instance | undefined> {
        const storageClient = await this.getStorageClient();

        const existingInstances = await storageClient.getObject<InstanceData[]>(Namespace.INSTANCES);

        const instanceData = existingInstances?.find(instance => instance.name === name);

        if (!instanceData) return undefined;

        const sharing = await storageClient.getObjectSharing(`${Namespace.INSTANCES}-${instanceData.id}`);

        return this.mapToInstance(instanceData, sharing);
    }

    async save(instance: Instance): Promise<void> {
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

    private async getInstanceDataInColletion(id: string): Promise<InstanceData | undefined> {
        const storageClient = await this.getStorageClient();

        const instanceData = await storageClient.getObjectInCollection<InstanceData>(Namespace.INSTANCES, id);

        return instanceData;
    }

    private async getObjectSharing(
        storageClient: StorageClient,
        data: InstanceData
    ): Promise<Either<ObjectSharingError, ObjectSharing>> {
        try {
            const objectSharing = await storageClient.getObjectSharing(`${Namespace.INSTANCES}-${data.id}`);

            return objectSharing ? Either.success(objectSharing) : Either.error("unexpected-error");
        } catch (error: any) {
            if (error.response?.status === 403) {
                return Either.error("authority-error");
            } else {
                return Either.error("unexpected-error");
            }
        }
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
            password: this.decryptPassword(data.password),
            ...sharing,
        });
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.configRepository.getStorageClient();
    }
}
