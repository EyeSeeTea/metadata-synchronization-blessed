import _ from "lodash";
import { Instance } from "../../domain/instance/entities/Instance";
import { InstanceMessage } from "../../domain/instance/entities/Message";
import { User } from "../../domain/instance/entities/User";
import { InstanceRepository } from "../../domain/instance/repositories/InstanceRepository";
import {
    CategoryOptionCombo,
    OrganisationUnit,
} from "../../domain/metadata/entities/MetadataEntities";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";

export class InstanceD2ApiRepository implements InstanceRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = new D2Api({ baseUrl: instance.url, auth: instance.auth });
    }

    public getApi(): D2Api {
        return this.api;
    }

    @cache()
    public async getUser(): Promise<User> {
        const { userGroups, ...user } = await this.api.currentUser
            .get({ fields: { id: true, name: true, email: true, userGroups: true } })
            .getData();

        return { ...user, userGroups: userGroups.map(({ id }) => id) };
    }

    @cache()
    public async getVersion(): Promise<string> {
        const { version } = await this.api.system.info.getData();
        return version;
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

    @cache()
    public async getCategoryOptionCombos(): Promise<
        Pick<CategoryOptionCombo, "id" | "name" | "categoryCombo" | "categoryOptions">[]
    > {
        const { objects } = await this.api.models.categoryOptionCombos
            .get({
                paging: false,
                fields: {
                    id: true,
                    name: true,
                    categoryCombo: true,
                    categoryOptions: true,
                },
            })
            .getData();

        return objects;
    }

    @cache()
    public async getOrgUnitRoots(): Promise<
        Pick<OrganisationUnit, "id" | "name" | "displayName" | "path">[]
    > {
        const { objects } = await this.api.models.organisationUnits
            .get({
                filter: { level: { eq: "1" } },
                fields: { id: true, name: true, displayName: true, path: true },
            })
            .getData();

        return objects;
    }

    public async sendMessage(message: InstanceMessage): Promise<void> {
        //@ts-ignore https://github.com/EyeSeeTea/d2-api/pull/52
        await this.api.messageConversations.post(message).getData();
    }
}
