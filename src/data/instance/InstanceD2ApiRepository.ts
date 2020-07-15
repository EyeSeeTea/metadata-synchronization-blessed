import Cryptr from "cryptr";
import _ from "lodash";
import { Instance, InstanceData } from "../../domain/instance/entities/Instance";
import { User } from "../../domain/instance/entities/User";
import { InstanceRepository } from "../../domain/instance/repositories/InstanceRepository";
import { getDataById } from "../../models/dataStore";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";

const instancesDataStoreKey = "instances";

export class InstanceD2ApiRepository implements InstanceRepository {
    private api: D2Api;

    constructor(instance: Instance, private encryptionKey: string) {
        this.api = new D2Api({ baseUrl: instance.url, auth: instance.auth });
    }

    @cache()
    public async getUser(): Promise<User> {
        const user = await this.api.currentUser
            .get({ fields: { id: true, name: true, email: true } })
            .getData();
        return user;
    }

    @cache()
    public async getVersion(): Promise<string> {
        const systemInfo = await this.api.system.info.getData();
        return systemInfo.version;
    }

    @cache()
    public getBaseUrl(): string {
        return this.api.baseUrl;
    }

    @cache()
    public async getDefaultIds(filter?: string): Promise<string[]> {
        const response = (await this.api
            .get("/metadata", {
                filter: "code:eq:default",
                fields: "id",
            })
            .getData()) as {
            [key: string]: { id: string }[];
        };

        const metadata = _.pickBy(response, (_value, type) => !filter || type === filter);

        return _(metadata)
            .omit(["system"])
            .values()
            .flatten()
            .map(({ id }) => id)
            .value();
    }

    public async getById(id: string): Promise<Instance> {
        const instanceData = await getDataById<InstanceData>(this.api, instancesDataStoreKey, id);

        if (!instanceData) {
            throw Error(`Instance with id ${id} not found`);
        }

        const instanceDataWithRawPassword = instanceData.password
            ? {
                  ...instanceData,
                  password: this.decryptPassword(instanceData.password),
              }
            : instanceData;

        const version = await this.testConnection(instanceDataWithRawPassword);

        return new Instance({ ...instanceDataWithRawPassword, version });
    }

    private async testConnection({ url, username, password }: InstanceData): Promise<string> {
        const auth = username && password ? { username, password } : undefined;
        const api = new D2Api({ baseUrl: url, auth });
        const systemInfo = await api.system.info.getData();

        return systemInfo.version;
    }

    private decryptPassword(encryptedPassword: string): string {
        const rawPassword =
            encryptedPassword.length > 0
                ? new Cryptr(this.encryptionKey).decrypt(encryptedPassword)
                : "";
        return rawPassword;
    }
}
