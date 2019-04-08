import _ from "lodash";
import { D2, Response } from "../types/d2";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import { deleteData, getPaginatedData, saveData, getData, getDataById } from "./dataStore";
import { generateUid } from "d2/uid";
import Cryptr from "cryptr";
import i18n from "@dhis2/d2-i18n";

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

    public static getOrCreate(data: Data | undefined, encryptionKey: string): Instance {
        let instance;
        if (data) {
            const cryptedInstace = new Instance(data);
            instance = cryptedInstace.decryptPassword(encryptionKey);
        } else {
            instance = this.create();
        }
        return instance;
    }

    public static async list(
        d2: D2,
        filters: TableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        return getPaginatedData(d2, instancesDataStoreKey, filters, pagination);
    }

    public static async get(d2: D2, id: string): Promise<Instance> {
        const instance = await getDataById(d2, instancesDataStoreKey, id);
        return new Instance(instance);
    }

    public async save(d2: D2, encryptionKey: string): Promise<Response> {
        const instance = this.encryptPassword(encryptionKey);
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

    public encryptPassword(encryptionKey: string) {
        const cryptr = new Cryptr(encryptionKey);
        const encrypted = cryptr.encrypt(this.data.password);
        return new Instance({ ...this.data, password: encrypted });
    }

    public decryptPassword(encryptionKey: string) {
        const cryptr = new Cryptr(encryptionKey);
        const decrypted = cryptr.decrypt(this.data.password);
        return new Instance({ ...this.data, password: decrypted });
    }

    public get description(): string {
        return this.data.description ? this.data.description : "";
    }

    public async validateUrlUsernameCombo(d2: D2) {
        const { url, username, id } = this.data;
        const combination = [url, username].join("-");
        const instanceArray = await getData(d2, instancesDataStoreKey);
        const invalidCombinations = instanceArray.filter(
            (inst: Data) => [inst.url, inst.username].join("-") === combination
        );
        let invalid;
        if (id) {
            invalid = invalidCombinations.some((inst: Data) => inst.id !== id);
        } else {
            invalid = !_.isEmpty(invalidCombinations);
        }

        return invalid;
    }

    public async validate(d2: D2) {
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
        const headers = new Headers({
            Authorization: "Basic " + btoa(username + ":" + password),
        });

        try {
            const res = await fetch(url + "/api/system/info", { method: "GET", headers });
            if (res.status === 401) {
                return { status: false, error: new Error(i18n.t("Wrong username/password")) };
            } else if (!res.ok) {
                return {
                    status: false,
                    error: new Error(i18n.t("Error: {{status}}", { status: res.status })),
                };
            } else {
                const json = await res.json();
                if (!json.version) {
                    return { status: false, error: new Error(i18n.t("Not a DHIS2 instance")) };
                } else {
                    return { status: true };
                }
            }
        } catch (err) {
            console.log({ err });
            if (err.message && err.message === "Failed to fetch") {
                return {
                    status: false,
                    error: new Error(
                        i18n.t(
                            "Network error {{error}}, probably wrong server host or CORS not enabled in DHIS2 instance",
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
