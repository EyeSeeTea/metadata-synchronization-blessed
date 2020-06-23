import { generateUid } from "d2/uid";
import _ from "lodash";
import { PartialBy } from "../../../types/utils";
import { ModelValidation, validateModel, ValidationError } from "../../common/entities/Validations";

export type PublicInstance = Omit<InstanceData, "password">;

export interface InstanceData {
    id: string;
    name: string;
    url: string;
    username?: string;
    password?: string;
    description?: string;
    version?: string;
}

export class Instance {
    private data: InstanceData;

    constructor(data: InstanceData) {
        this.data = data;
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

    public get username(): string | undefined {
        return this.data.username;
    }

    public get password(): string | undefined {
        return this.data.password;
    }

    public get auth(): { username: string; password: string } | undefined {
        return this.username && this.password
            ? { username: this.username, password: this.password }
            : undefined;
    }

    public get description(): string {
        return this.data.description ?? "";
    }

    public get version(): string | undefined {
        return this.data.version;
    }

    public get apiVersion(): number {
        const apiVersion = _.get(this.version?.split("."), 1);
        if (!apiVersion) throw new Error("Invalid api version");
        return Number(apiVersion);
    }

    public toObject(): PublicInstance {
        return _.omit(this.data, ["password"]);
    }

    public validate(filter?: string[]): ValidationError[] {
        return validateModel<Instance>(this, this.moduleValidations()).filter(
            ({ property }) => filter?.includes(property) ?? true
        );
    }

    public static build = (data: PartialBy<InstanceData, "id">): Instance => {
        return new Instance({ id: generateUid(), ...data });
    };

    private moduleValidations = (): ModelValidation[] => [
        { property: "name", validation: "hasText" },
        { property: "url", validation: "hasText" },
        { property: "username", validation: "hasText" },
        { property: "password", validation: "hasText" },
    ];
}
