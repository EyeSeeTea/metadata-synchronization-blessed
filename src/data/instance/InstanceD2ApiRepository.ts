import _ from "lodash";
import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { Instance, InstanceData } from "../../domain/instance/entities/Instance";
import { InstanceMessage } from "../../domain/instance/entities/Message";
import { User } from "../../domain/instance/entities/User";
import { InstanceRepository } from "../../domain/instance/repositories/InstanceRepository";
import { OrganisationUnit } from "../../domain/metadata/entities/MetadataEntities";
import { ObjectSharing, StorageClient } from "../../domain/storage/repositories/StorageClient";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { Namespace } from "../storage/Namespaces";

export class InstanceD2ApiRepository implements InstanceRepository {
    private api: D2Api;

    constructor(
        private configRepository: ConfigRepository,
        private instance: Instance,
        private encryptionKey: string
    ) {
        this.api = getD2APiFromInstance(instance);
    }

    async getById(id: string): Promise<Instance | undefined> {
        const storageClient = await this.getStorageClient();

        const instanceData = await storageClient.getObjectInCollection<InstanceData>(
            Namespace.INSTANCES,
            id
        );

        if (!instanceData) return undefined;

        const sharing = await storageClient.getObjectSharing(
            `${Namespace.INSTANCES}-${instanceData.id}`
        );

        return this.mapToInstance(instanceData, sharing);
    }

    async getByName(name: string): Promise<Instance | undefined> {
        const storageClient = await this.getStorageClient();

        const existingInstances = await storageClient.getObject<InstanceData[]>(
            Namespace.INSTANCES
        );

        const instanceData = existingInstances?.find(instance => instance.name === name);

        if (!instanceData) return undefined;

        const sharing = await storageClient.getObjectSharing(
            `${Namespace.INSTANCES}-${instanceData.id}`
        );

        return this.mapToInstance(instanceData, sharing);
    }

    async save(instance: Instance): Promise<void> {
        const storageClient = await this.getStorageClient();

        const instanceEncypted = instance.encryptPassword(this.encryptionKey);

        const instanceData = {
            ..._.omit(
                instanceEncypted.toObject(),
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
        };

        await storageClient.saveObjectInCollection(Namespace.INSTANCES, instanceData);

        const objectSharing = {
            publicAccess: instance.publicAccess,
            externalAccess: false,
            user: instance.user,
            userAccesses: instance.userAccesses,
            userGroupAccesses: instance.userGroupAccesses,
        };

        await storageClient.saveObjectSharing(
            `${Namespace.INSTANCES}-${instanceData.id}`,
            objectSharing
        );
    }

    public getApi(): D2Api {
        return this.api;
    }

    //TODO: this should be in a UserRepository
    @cache()
    public async getUser(): Promise<User> {
        return this.api.currentUser
            .get({
                fields: {
                    id: true,
                    name: true,
                    email: true,
                    userGroups: { id: true, name: true },
                    organisationUnits: { id: true, name: true },
                    dataViewOrganisationUnits: { id: true, name: true },
                },
            })
            .getData();
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
    public async getOrgUnitRoots(): Promise<
        Pick<OrganisationUnit, "id" | "name" | "displayName" | "path">[]
    > {
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

    private mapToInstance(instanceData: InstanceData, sharing: ObjectSharing | undefined) {
        const instance = Instance.build({
            ...instanceData,
            url: instanceData.type === "local" ? this.instance.url : instanceData.url,
            version: instanceData.type === "local" ? this.instance.version : instanceData.version,
            ...sharing,
        }).decryptPassword(this.encryptionKey);

        return instance;
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.configRepository.getStorageClient();
    }
}
