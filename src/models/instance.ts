import _ from "lodash";
import axios from "axios";
import Cryptr from "cryptr";
import i18n from "@dhis2/d2-i18n";
import { generateUid } from "d2/uid";

import { deleteData, getData, getDataById, getPaginatedData, saveData } from "./dataStore";
import { D2, Response } from "../types/d2";
import { Validation } from "../types/validations";
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
    private static encryptionKey: string;

    private readonly data: Data;

    constructor(data: Data) {
        this.data = _.pick(data, ["id", "name", "url", "username", "password", "description"]);
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
        };
        return new Instance(initialData);
    }

    public static async build(data: Data | undefined): Promise<Instance> {
        const instance = data ? new Instance(data) : this.create();
        return await instance.decryptPassword();
    }

    public static async get(d2: D2, id: string): Promise<Instance> {
        const data = await getDataById(d2, instancesDataStoreKey, id);
        return this.build(data);
    }

    public static async list(
        d2: D2,
        filters: TableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        return getPaginatedData(d2, instancesDataStoreKey, filters, pagination);
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

    public encryptPassword(): Instance {
        const password =
            this.data.password.length > 0
                ? new Cryptr(Instance.encryptionKey).encrypt(this.data.password)
                : "";
        return new Instance({ ...this.data, password });
    }

    public decryptPassword(): Instance {
        const password =
            this.data.password.length > 0
                ? new Cryptr(Instance.encryptionKey).decrypt(this.data.password)
                : "";
        return new Instance({ ...this.data, password });
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
                !password
                    ? {
                          key: "cannot_be_blank",
                          namespace: { field: "password" },
                      }
                    : null,
            ]),
        });
    }

    public async check(): Promise<Response> {
        const { url, username, password } = this.data;

        try {
            const response = await axios.get(url + "/api/system/info", {
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
                if (error.response.status === 401) {
                    return { status: false, error: new Error(i18n.t("Wrong username/password")) };
                } else if (error.response.status) {
                    return {
                        status: false,
                        error: new Error(
                            i18n.t("Error: {{status}}", { status: error.response.status })
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
            }

            console.log({ error });
            return { status: false, error };
        }
    }
}
