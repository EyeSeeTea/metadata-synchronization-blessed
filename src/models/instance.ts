import i18n from "@dhis2/d2-i18n";
import axios, { AxiosBasicCredentials } from "axios";
import Cryptr from "cryptr";
import { D2Api, D2ApiDefault } from "d2-api";
import { generateUid } from "d2/uid";
import _ from "lodash";
import { D2, Response } from "../types/d2";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import { Validation } from "../types/validations";
import { deleteData, getData, getDataById, getPaginatedData, saveData } from "./dataStore";

const instancesDataStoreKey = "instances";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface MetadataMapping {
    mappedId?: string;
    mappedName?: string;
    mappedCode?: string;
    code?: string;
    mapping?: MetadataMappingDictionary;
    conflicts?: boolean;
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

export default class Instance {
    private static encryptionKey: string;

    private readonly data: InstanceData;
    private readonly api: D2Api;

    constructor(data: InstanceData) {
        this.data = _.pick(data, [
            "id",
            "name",
            "url",
            "username",
            "password",
            "description",
            "metadataMapping",
        ]);
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
        const initialData = {
            id: "",
            name: "",
            url: "",
            username: "",
            password: "",
            metadataMapping: {},
        };
        return new Instance(initialData);
    }

    public static async build(data: InstanceData | undefined): Promise<Instance> {
        const instance = data ? new Instance(data) : this.create();
        return instance.decryptPassword();
    }

    public static async get(d2: D2, id: string): Promise<Instance | undefined> {
        const data = await getDataById(d2, instancesDataStoreKey, id);
        return data ? this.build(data) : undefined;
    }

    public static async list(
        d2: D2,
        filters: TableFilters | null,
        pagination: TablePagination | null
    ): Promise<TableList> {
        return getPaginatedData(d2, instancesDataStoreKey, filters, pagination);
    }

    public async save(d2: D2): Promise<Response> {
        const lastInstance = await Instance.get(d2, this.id);

        const instanceWithPassword =
            lastInstance !== undefined && this.password === ""
                ? this.setPassword(lastInstance.password)
                : this;

        const instance = instanceWithPassword.encryptPassword();
        const exists = !!instance.data.id;
        const element = exists ? instance.data : { ...instance.data, id: generateUid() };

        if (exists) await instance.remove(d2);

        return saveData(d2, instancesDataStoreKey, element);
    }

    public async remove(d2: D2): Promise<Response> {
        return deleteData(d2, instancesDataStoreKey, this.data);
    }

    public toObject(): Omit<InstanceData, "password"> {
        return _.omit(this.data, ["password"]);
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

    public async validateUrlUsernameCombo(d2: D2): Promise<boolean> {
        const { url, username, id } = this.data;
        const combination = [url, username].join("-");
        const instanceArray = await getData(d2, instancesDataStoreKey);
        const invalidCombinations = instanceArray.filter(
            (inst: InstanceData) => [inst.url, inst.username].join("-") === combination
        );

        return id
            ? invalidCombinations.some((inst: InstanceData) => inst.id !== id)
            : !_.isEmpty(invalidCombinations);
    }

    public async validate(d2: D2): Promise<Validation> {
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
                (await this.validateUrlUsernameCombo(d2))
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
