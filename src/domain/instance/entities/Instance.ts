import { generateUid } from "d2/uid";
import _ from "lodash";
import { PartialBy } from "../../../types/utils";
import { NamedRef, SharedRef } from "../../common/entities/Ref";
import { ShareableEntity } from "../../common/entities/ShareableEntity";
import { SharingSetting } from "../../common/entities/SharingSetting";
import { ModelValidation, validateModel, ValidationError } from "../../common/entities/Validations";

export type PublicInstance = Omit<InstanceData, "password">;
export type InstanceType = "local" | "dhis";

export interface InstanceData extends SharedRef {
    type: InstanceType;
    id: string;
    name: string;
    url: string;
    username?: string;
    password?: string;
    description?: string;
    version?: string;
}

export class Instance extends ShareableEntity<InstanceData> {
    private constructor(data: InstanceData) {
        super(data);
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
        return this.username && this.password ? { username: this.username, password: this.password } : undefined;
    }

    public get description(): string {
        return this.data.description ?? "";
    }

    public get version(): string | undefined {
        return this.data.version;
    }

    public get apiVersion(): number {
        const apiVersion = _.get(this.version?.split("."), 1);
        // TODO: Review implications of having a default value here
        // Not having this set means no connection possible on save
        // For example, we should error during sync instead
        return apiVersion ? Number(apiVersion) : 30;
    }

    public get created(): Date {
        return this.data.lastUpdated;
    }

    public get lastUpdated(): Date {
        return this.data.lastUpdated;
    }

    public get lastUpdatedBy(): NamedRef {
        return this.data.lastUpdatedBy;
    }

    public get user(): NamedRef {
        return this.data.user;
    }

    public get publicAccess(): string {
        return this.data.publicAccess ?? "--------";
    }

    public get userAccesses(): SharingSetting[] {
        return this.data.userAccesses ?? [];
    }

    public get userGroupAccesses(): SharingSetting[] {
        return this.data.userGroupAccesses ?? [];
    }

    public get existsShareSettingsInDataStore(): boolean {
        return this.apiVersion > 31;
    }

    public toObject(): InstanceData {
        return _.cloneDeep(this.data);
    }

    public toPublicObject(): PublicInstance {
        return _(this.data).omit(["password"]).cloneDeep();
    }

    public validate(filter?: string[]): ValidationError[] {
        const validations = this.type === "local" ? this.localInstanceValidations() : this.moduleValidations();

        return validateModel<Instance>(this, validations).filter(({ property }) => filter?.includes(property) ?? true);
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

    public static build(
        data: PartialBy<
            InstanceData,
            | "id"
            | "type"
            | "created"
            | "publicAccess"
            | "lastUpdated"
            | "lastUpdatedBy"
            | "user"
            | "userAccesses"
            | "userGroupAccesses"
        >
    ): Instance {
        const { type = "dhis", id = generateUid() } = data;
        return new Instance({
            type,
            id: type === "local" ? "LOCAL" : id,
            created: new Date(),
            publicAccess: "--------",
            lastUpdated: new Date(),
            lastUpdatedBy: {
                id: "",
                name: "",
            },
            user: {
                id: "",
                name: "",
            },
            userAccesses: [],
            userGroupAccesses: [],
            ...data,
        });
    }

    private moduleValidations = (): ModelValidation[] => [
        { property: "name", validation: "hasText" },
        { property: "url", validation: "isUrl" },
        { property: "url", validation: "hasText" },
        { property: "username", validation: "hasText" },
        { property: "password", validation: "hasText" },
    ];

    private localInstanceValidations = (): ModelValidation[] => [{ property: "name", validation: "hasText" }];
}
