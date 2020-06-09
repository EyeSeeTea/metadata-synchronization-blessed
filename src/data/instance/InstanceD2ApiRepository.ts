import Cryptr from "cryptr";
import _ from "lodash";
import Instance, { InstanceData } from "../../domain/instance/Instance";
import InstanceRepository from "../../domain/instance/InstanceRepository";
import { getDataById } from "../../models/dataStore";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";

const instancesDataStoreKey = "instances";

export default class InstanceD2ApiRepository implements InstanceRepository {
    constructor(private api: D2Api, private encryptionKey: string) {
    }

    public async getById(id: string): Promise<Instance> {
        const instanceData = await getDataById<InstanceData>(this.api, instancesDataStoreKey, id);

        if (!instanceData) {
            throw Error(`Instance with id ${id} not found`);
        }

        const instanceDataWithRawPassword = {
            ...instanceData,
            password: this.decryptPassword(instanceData.password),
        };

        const version = await this.getVersion(instanceDataWithRawPassword);

        return new Instance({ ...instanceDataWithRawPassword, version });
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

    private async getVersion(instanceData: InstanceData): Promise<string> {
        const api = new D2Api({
            baseUrl: instanceData.url,
            auth: { username: instanceData.username, password: instanceData.password },
        });

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
