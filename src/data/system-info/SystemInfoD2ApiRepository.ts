import { Instance } from "../../domain/instance/entities/Instance";
import { SystemInfo } from "../../domain/system-info/entities/SystemInfo";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { SystemSettingsRepository } from "../../domain/system-info/repositories/SystemInfoRepository";

export class SystemInfoD2ApiRepository implements SystemSettingsRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public async get(): Promise<SystemInfo> {
        const { lastAnalyticsTableSuccess } = await this.api.system.info.getData();
        return { lastAnalyticsTableSuccess: lastAnalyticsTableSuccess };
    }
}
