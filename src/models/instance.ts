import {D2} from "../types/d2";
import {TableFilters, TableList, TablePagination} from "../types/d2-ui-components";
import {Response} from "../types/d2";
import {listInstances, saveNewInstance} from "./dataStore";
import _ from "lodash";

export interface Data {
    name: string;
    url: string;
    username: string;
    password: string;
    description?: string;
}

export default class Instance {
    constructor(private data: Data) {
        // TODO: We should encrypt password
    }

    public static create(): Instance {
        const initialData = {
            name: "",
            url: "",
            username: "",
            password: ""
        };
        return new Instance(initialData);
    }

    public static async list(d2: D2, filters: TableFilters, pagination: TablePagination): Promise<TableList<Instance>> {
        return listInstances(d2, filters, pagination);
    }

    public async save(d2: D2): Promise<Response> {
        return saveNewInstance(d2, this.data);
    }

    public validate() {
        const { name, url, username, password } = this.data;

        return _.pickBy({
            name: !name.trim() ? {
                key: "cannot_be_blank",
                namespace: {field: "name"}
            } : null,

            url: !url.trim() ? {
                key: "cannot_be_blank",
                namespace: {field: "url"}
            } : null,

            username: !username.trim() ? {
                key: "cannot_be_blank",
                namespace: {field: "username"}
            } : null,

            password: !password.trim() ? {
                key: "cannot_be_blank",
                namespace: {field: "password"}
            } : null,

        });
    }

    public setName(name: string): Instance {
        return new Instance({...this.data, name});
    }

    public get name(): string {
        return this.data.name;
    }

    public setUrl(url: string): Instance {
        return new Instance({...this.data, url});
    }

    public get url(): string {
        return this.data.url;
    }

    public setUsername(username: string): Instance {
        return new Instance({...this.data, username});
    }

    public get username(): string {
        return this.data.username;
    }

    public setPassword(password: string): Instance {
        return new Instance({...this.data, password});
    }

    public get password(): string {
        return this.data.password;
    }

    public setDescription(description: string): Instance {
        return new Instance({...this.data, description});
    }

    public get description(): string {
        return this.data.description ? this.data.description : "";
    }
}
