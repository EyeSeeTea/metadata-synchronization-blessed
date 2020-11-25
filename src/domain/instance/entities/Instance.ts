import Cryptr from "cryptr";
import { generateUid } from "d2/uid";
import _ from "lodash";
import { PartialBy } from "../../../types/utils";
import { ModelValidation, validateModel, ValidationError } from "../../common/entities/Validations";
import { MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";

export type PublicInstance = Omit<InstanceData, "password">;
export type InstanceType = "local" | "dhis";

export interface InstanceData {
    type: InstanceType;
    id: string;
    name: string;
    url: string;
    metadataMapping?: MetadataMappingDictionary;
    username?: string;
    password?: string;
    description?: string;
    version?: string;
}

export class Instance {
    private data: InstanceData;

    private constructor(data: InstanceData) {
        this.data = data;
    }

    public get type(): InstanceType {
        return this.data.type;
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

    public get metadataMapping(): MetadataMappingDictionary {
        return this.data.metadataMapping ?? {};
    }

    public get version(): string {
        return this.data.version ?? "2.30";
    }

    public get apiVersion(): number {
        const apiVersion = _.get(this.version?.split("."), 1);
        if (!apiVersion) throw new Error("Invalid api version");
        return Number(apiVersion);
    }

    public toObject(): InstanceData {
        return _.cloneDeep(this.data);
    }

    public toPublicObject(): PublicInstance {
        return _(this.data).omit(["password"]).cloneDeep();
    }

    public validate(filter?: string[]): ValidationError[] {
        return validateModel<Instance>(this, this.moduleValidations()).filter(
            ({ property }) => filter?.includes(property) ?? true
        );
    }

    public update(data?: Partial<Pick<Instance, keyof InstanceData>>): Instance {
        return Instance.build({ ...this.data, ...data });
    }

    public replicate(): Instance {
        return this.update({
            name: `Copy of ${this.data.name}`,
            id: generateUid(),
        });
    }

    public static build(data: PartialBy<InstanceData, "id" | "type">): Instance {
        const { type = "dhis", id = generateUid() } = data;
        return new Instance({ type, id: type === "local" ? "LOCAL" : id, ...data });
    }

    private moduleValidations = (): ModelValidation[] => [
        { property: "name", validation: "hasText" },
        { property: "url", validation: "isUrl" },
        { property: "url", validation: "hasText" },
        { property: "username", validation: "hasText" },
        { property: "password", validation: "hasText" },
    ];

    public decryptPassword(encryptionKey: string): Instance {
        const password = this.password ? new Cryptr(encryptionKey).decrypt(this.password) : "";
        return Instance.build({ ...this.data, password });
    }

    public encryptPassword(encryptionKey: string): Instance {
        const password = this.password ? new Cryptr(encryptionKey).encrypt(this.password) : "";
        return Instance.build({ ...this.data, password });
    }
}
