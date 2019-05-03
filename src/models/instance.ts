import _ from "lodash";
import axios from "axios";
import Cryptr from "cryptr";
import i18n from "@dhis2/d2-i18n";
import { generateUid } from "d2/uid";

import { deleteData, getPaginatedData, saveData, getData, getDataById } from "./dataStore";
import { D2, Response } from "../types/d2";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";

const instancesDataStoreKey = "instances";

export interface Data {
    id: string;
    name: string;
    url: string;
    username: string;
    password: string;
    description?: string;
}

export default class Instance {
    private readonly data: Data;

    constructor(data: Data) {
        this.data = _.pick(data, ["id", "name", "url", "username", "password", "description"]);
    }

    public static create(): Instance {
        const initialData = {
            id: "",
            name: "",
            url: "",
            username: "",
            password: "",
        };
        return new Instance(initialData);
    }

    public static async parse(data: Data | undefined): Promise<Instance> {
        const instance = data ? new Instance(data) : this.create();
        return await instance.decryptPassword();
    }

    public static async get(d2: D2, id: string): Promise<Instance> {
        const data = await getDataById(d2, instancesDataStoreKey, id);
        return this.parse(data);
    }

    public static async list(
        d2: D2,
        filters: TableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        return getPaginatedData(d2, instancesDataStoreKey, filters, pagination);
    }

    private static async getEncryptionKey(): Promise<any> {
        const appConfig = await axios.get("app-config.json");
        return appConfig.data.encryptionKey;
    }

    public async save(d2: D2): Promise<Response> {
        const instance = await this.encryptPassword();
        let toSave;
        if (instance.data.id) {
            toSave = instance.data;
            await instance.remove(d2);
        } else {
            toSave = { ...instance.data, id: generateUid() };
        }
        return saveData(d2, instancesDataStoreKey, toSave);
    }

    public async remove(d2: D2): Promise<Response> {
        return deleteData(d2, instancesDataStoreKey, this.data);
    }

    public setId(id: string): Instance {
        return new Instance({ ...this.data, id });
    }

    public get id(): string {
        return this.data.id;
    }

    public setName(name: string): Instance {
        return new Instance({ ...this.data, name });
    }

    public get name(): string {
        return this.data.name;
    }

    public setUrl(url: string): Instance {
        return new Instance({ ...this.data, url });
    }

    public get url(): string {
        return this.data.url;
    }

    public setUsername(username: string): Instance {
        return new Instance({ ...this.data, username });
    }

    public get username(): string {
        return this.data.username;
    }

    public setPassword(password: string): Instance {
        return new Instance({ ...this.data, password });
    }

    public get password(): string {
        return this.data.password;
    }

    public setDescription(description: string): Instance {
        return new Instance({ ...this.data, description });
    }

    public async encryptPassword(): Promise<Instance> {
        const encryptionKey = await Instance.getEncryptionKey();
        const encrypted = new Cryptr(encryptionKey).encrypt(this.data.password);
        return new Instance({ ...this.data, password: encrypted });
    }

    public async decryptPassword(): Promise<Instance> {
        const encryptionKey = await Instance.getEncryptionKey();
        const decrypted = new Cryptr(encryptionKey).decrypt(this.data.password);
        return new Instance({ ...this.data, password: decrypted });
    }

    public get description(): string {
        return this.data.description ? this.data.description : "";
    }

    public async validateUrlUsernameCombo(d2: D2): Promise<boolean> {
        const { url, username, id } = this.data;
        const combination = [url, username].join("-");
        const instanceArray = await getData(d2, instancesDataStoreKey);
        const invalidCombinations = instanceArray.filter(
            (inst: Data) => [inst.url, inst.username].join("-") === combination
        );

        return id
            ? invalidCombinations.some((inst: Data) => inst.id !== id)
            : !_.isEmpty(invalidCombinations);
    }

    public async validate(d2: D2): Promise<any> {
        const { name, url, username, password } = this.data;
        return _.pickBy({
            name: !name.trim()
                ? {
                      key: "cannot_be_blank",
                      namespace: { field: "name" },
                  }
                : null,
            url: !url
                ? {
                      key: "cannot_be_blank",
                      namespace: { field: "url" },
                  }
                : null,
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
            password: !password
                ? {
                      key: "cannot_be_blank",
                      namespace: { field: "password" },
                  }
                : null,
        });
    }

    public async check(): Promise<Response> {
        const { url, username, password } = this.data;

        try {
            const response = await axios.get(url + "/api/system/info", {
                auth: { username, password },
            });

            if (response.status === 200 && response.data.version) {
                return { status: true };
            } else if (response.status === 200) {
                return { status: false, error: new Error(i18n.t("Not a valid DHIS2 instance")) };
            } else if (response.status === 401) {
                return { status: false, error: new Error(i18n.t("Wrong username/password")) };
            } else {
                return {
                    status: false,
                    error: new Error(i18n.t("Error: {{status}}", { status: response.status })),
                };
            }
        } catch (err) {
            console.log({ err });
            if (err.message && err.message === "Failed to fetch") {
                return {
                    status: false,
                    error: new Error(
                        i18n.t(
                            "Network error {{error}}, check if server is up and CORS is enabled",
                            { error: err.toString() }
                        )
                    ),
                };
            } else {
                return { status: false, error: err };
            }
        }
    }
}
