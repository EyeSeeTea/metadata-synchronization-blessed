import i18n from "@dhis2/d2-i18n";
import axios, { AxiosBasicCredentials } from "axios";
import Cryptr from "cryptr";
import { D2Api, D2ApiDefault } from "d2-api";
import { generateUid } from "d2/uid";
import _ from "lodash";
import { Response } from "../types/d2";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import { Validation } from "../types/validations";
import { getDataStore, deleteData, saveData, saveDataStore, deleteDataStore } from "./dataStore";
import { getData, getDataById, getPaginatedData } from "./dataStore";

const instancesDataStoreKey = "instances";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface MetadataMapping {
    mappedId?: string;
    mappedName?: string;
    mappedCode?: string;
    mappedLevel?: number;
    code?: string;
    mapping?: MetadataMappingDictionary;
    conflicts?: boolean;
    global?: boolean;
    [key: string]: unknown;
}

export interface MetadataMappingDictionary {
    [model: string]: {
        [id: string]: MetadataMapping;
    };
}

export interface InstanceData {
    id: string;
    name: string;
    url: string;
    username: string;
    password: string;
    description?: string;
    metadataMapping: MetadataMappingDictionary;
}

type InstanceDataMain = Omit<InstanceData, "metadataMapping">;

export interface InstanceDetailsData {
    metadataMapping: MetadataMappingDictionary;
}

const mainDefaultData: InstanceDataMain = {
    id: "",
    name: "",
    url: "",
    username: "",
    password: "",
    description: "",
};

const initialData: InstanceData = {
    ...mainDefaultData,
    metadataMapping: {},
};

export default class Instance {
    private static encryptionKey: string;

    private readonly data: InstanceData;
    private readonly api: D2Api;

    constructor(data: InstanceData) {
        this.data = _.pick(data, _.keys(initialData) as Array<keyof InstanceData>);
        const { url: baseUrl, username, password } = data;
        this.api = new D2ApiDefault({ baseUrl, auth: { username, password } });
    }

    public replicate(): Instance {
        return this.setName(`Copy of ${this.data.name}`).setId(generateUid());
    }

    public get id(): string {
        return this.data.id;
    }

    public get name(): string {
        return this.data.name;
    }

    public get url(): string {
        return this.data.url;
    }

    public get apiUrl(): string {
        return this.data.url + "/api";
    }

    public get username(): string {
        return this.data.username;
    }

    public get password(): string {
        return this.data.password;
    }

    public get description(): string {
        return this.data.description ?? "";
    }

    public get metadataMapping(): MetadataMappingDictionary {
        return this.data.metadataMapping ?? {};
    }

    public get auth(): AxiosBasicCredentials {
        return { username: this.data.username, password: this.data.password };
    }

    public getApi(): D2Api {
        return this.api;
    }

    public static setEncryptionKey(encryptionKey: string): void {
        this.encryptionKey = encryptionKey;
    }

    public static create(): Instance {
        return new Instance(initialData);
    }

    public static async build(data: InstanceData | undefined): Promise<Instance> {
        const instance = data ? new Instance(data) : this.create();
        return instance.decryptPassword();
    }

    private static getDetailsKey(instanceData: InstanceData): string {
        return instancesDataStoreKey + "-" + instanceData.id;
    }

    public static async get(api: D2Api, id: string): Promise<Instance | undefined> {
        const instanceData = await getDataById<InstanceData>(api, instancesDataStoreKey, id);
        if (!instanceData) return;
        const detailsKey = this.getDetailsKey(instanceData);
        const defaultDetails: InstanceDetailsData = { metadataMapping: {} };
        const detailsData = await getDataStore(api, detailsKey, defaultDetails);
        const dataWithMapping = { ...instanceData, metadataMapping: detailsData.metadataMapping };
        return this.build(dataWithMapping);
    }

    public static async list(
        api: D2Api,
        filters: TableFilters | null,
        pagination: TablePagination | null
    ): Promise<TableList> {
        return getPaginatedData(api, instancesDataStoreKey, filters, pagination);
    }

    public async save(api: D2Api): Promise<Response> {
        const lastInstance = await Instance.get(api, this.id);
        const password = this.password || lastInstance?.password;
        if (!password) throw new Error("Attempting to save an instance without password");

        const instance = this.setPassword(password).encryptPassword();
        const exists = !!instance.data.id;
        const element = exists ? instance.data : { ...instance.data, id: generateUid() };

        if (exists) await instance.remove(api);

        const detailsKey = Instance.getDetailsKey(instance);
        const detailsData: InstanceDetailsData = { metadataMapping: instance.metadataMapping };
        const response: Response = await toResponse(saveDataStore(api, detailsKey, detailsData));
        const mainElement = _.pick(element, _.keys(mainDefaultData));
        return response.status ? saveData(api, instancesDataStoreKey, mainElement) : response;
    }

    public async remove(api: D2Api): Promise<Response> {
        const response = await deleteData(api, instancesDataStoreKey, this.data);
        const detailsKey = Instance.getDetailsKey(this.data);
        return response.status ? toResponse(deleteDataStore(api, detailsKey)) : response;
    }

    public toObject(): Omit<InstanceData, "password" | "metadataMapping"> {
        return _.omit(this.data, ["password", "metadataMapping"]);
    }

    public setId(id: string): Instance {
        return new Instance({ ...this.data, id });
    }

    public setName(name: string): Instance {
        return new Instance({ ...this.data, name });
    }

    public setUrl(url: string): Instance {
        return new Instance({ ...this.data, url: url.replace(/\/+$/, "") });
    }

    public setUsername(username: string): Instance {
        return new Instance({ ...this.data, username });
    }

    public setPassword(password: string): Instance {
        return new Instance({ ...this.data, password });
    }

    public setDescription(description: string): Instance {
        return new Instance({ ...this.data, description });
    }

    public setMetadataMapping(metadataMapping: MetadataMappingDictionary): Instance {
        return new Instance({ ...this.data, metadataMapping });
    }

    private encryptPassword(): Instance {
        const password =
            this.data.password.length > 0
                ? new Cryptr(Instance.encryptionKey).encrypt(this.data.password)
                : "";
        return new Instance({ ...this.data, password });
    }

    private decryptPassword(): Instance {
        const password =
            this.data.password.length > 0
                ? new Cryptr(Instance.encryptionKey).decrypt(this.data.password)
                : "";
        return new Instance({ ...this.data, password });
    }

    public async validateUrlUsernameCombo(api: D2Api): Promise<boolean> {
        const { url, username, id } = this.data;
        const combination = [url, username].join("-");
        const instanceArray = await getData(api, instancesDataStoreKey);
        const invalidCombinations = instanceArray.filter(
            (inst: InstanceData) => [inst.url, inst.username].join("-") === combination
        );

        return id
            ? invalidCombinations.some((inst: InstanceData) => inst.id !== id)
            : !_.isEmpty(invalidCombinations);
    }

    public async validate(api: D2Api): Promise<Validation> {
        const { name, url, username, password } = this.data;

        return _.pickBy({
            name: _.compact([
                !name.trim()
                    ? {
                          key: "cannot_be_blank",
                          namespace: { field: "name" },
                      }
                    : null,
            ]),
            url: _.compact([
                !url
                    ? {
                          key: "cannot_be_blank",
                          namespace: { field: "url" },
                      }
                    : null,
            ]),
            username: _.compact([
                !username
                    ? {
                          key: "cannot_be_blank",
                          namespace: { field: "username" },
                      }
                    : null,
                (await this.validateUrlUsernameCombo(api))
                    ? {
                          key: "url_username_combo_already_exists",
                          namespace: { field: "username", other: "url" },
                      }
                    : null,
            ]),
            password: _.compact([
                !password && !this.id
                    ? {
                          key: "cannot_be_blank",
                          namespace: { field: "password" },
                      }
                    : null,
            ]),
        });
    }

    public async check(): Promise<Response> {
        try {
            const { url, username, password } = this.data;
            const cleanUrl = url.replace(/\/$/, "");

            const response = await axios.get(cleanUrl + "/api/system/info", {
                auth: { username, password },
            });

            return response.data.version
                ? { status: true }
                : {
                      status: false,
                      error: new Error(i18n.t("Not a valid DHIS2 instance")),
                  };
        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        return {
                            status: false,
                            error: new Error(i18n.t("Wrong username/password")),
                        };
                    case 404:
                        return { status: false, error: new Error(i18n.t("Wrong URL endpoint")) };
                    default:
                        return {
                            status: false,
                            error: new Error(
                                i18n.t("Error {{status}}", { status: error.response.status })
                            ),
                        };
                }
            } else if (error.request) {
                return {
                    status: false,
                    error: new Error(
                        i18n.t(
                            "Network error {{error}}, check if server is up and CORS is enabled",
                            { error: error.toString() }
                        )
                    ),
                };
            } else {
                console.debug({ error });
                return { status: false, error };
            }
        }
    }
}

export async function toResponse(promise: Promise<void>): Promise<Response> {
    try {
        await promise;
        return { status: true };
    } catch (error) {
        return { status: false, error };
    }
}
