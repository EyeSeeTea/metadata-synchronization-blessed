import _ from "lodash";
import { D2, Response } from "../types/d2";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import { deleteInstance, listInstances, saveNewInstance, getDataStoreData } from "./dataStore";
import { generateUid } from "d2/uid";
import i18n from "@dhis2/d2-i18n";

import { invalid } from "moment";

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

    public static async list(
        d2: D2,
        filters: TableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        return listInstances(d2, filters, pagination);
    }

    public async save(d2: D2): Promise<Response> {
        let instance;

        if (!!this.data.id) {
            instance = this.data;
            await this.remove(d2);
        } else {
            instance = { ...this.data, id: generateUid() };
        }

        return saveNewInstance(d2, instance);
    }

    public async remove(d2: D2): Promise<Response> {
        return deleteInstance(d2, this.data);
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

    public get description(): string {
        return this.data.description ? this.data.description : "";
    }

    public async validateUrlUsernameCombo(d2: D2) {
        const { url, username } = this.data;
        const combination = [url, username].join("-");
        const instanceArray = await getDataStoreData(d2, instancesDataStoreKey);
        const invalidCombination = instanceArray.some(
            (inst: Data) => [inst.url, inst.username].join("-") === combination
        );
        return invalidCombination;
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
