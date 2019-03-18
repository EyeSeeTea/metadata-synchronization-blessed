import _ from "lodash";
import { D2 } from "../types/d2";
import { TableFilters, TableList, TablePagination } from "../types/d2-ui-components";
import { Response } from "../types/d2";
import { deleteInstance, listInstances, saveNewInstance, validateInstanceId } from "./dataStore";

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
        return saveNewInstance(d2, this.data);
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

    public async validateInstanceId(d2: D2): Promise<Response> {
        const { id } = this.data;
        return validateInstanceId(d2, id);
    }
}
