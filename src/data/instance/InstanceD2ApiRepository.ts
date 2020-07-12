import { D2Api } from "../../types/d2-api";
import InstanceRepository from "../../domain/instance/InstanceRepository";
import Instance, { InstanceData } from "../../domain/instance/Instance";
import { getDataById } from "../../models/dataStore";
import Cryptr from "cryptr";

const instancesDataStoreKey = "instances";

export default class InstanceD2ApiRepository implements InstanceRepository {
    private d2Api: D2Api;

    //TODO: composition root - This dependency should be injected by constructor when we have
    // composition root. Currently the unique solution is to have this static field
    // and assign the value from app.jsx that It's where encryptionKey is loaded usign appConfig.
    public static encryptionKey: string;

    constructor(d2Api: D2Api) {
        //TODO: composition root - when we have composition root evaluate if has sense
        // that this dependency should be current instance instead of D2Api
        this.d2Api = d2Api;
    }
    async getById(id: string): Promise<Instance> {
        const instanceData = await getDataById<InstanceData>(this.d2Api, instancesDataStoreKey, id);

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
                ? new Cryptr(InstanceD2ApiRepository.encryptionKey).decrypt(encryptedPassword)
                : "";
        return rawPassword;
    }
}
