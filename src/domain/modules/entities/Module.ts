import { generateUid } from "d2/uid";
import { SynchronizationBuilder } from "../../../types/synchronization";
import { NamedRef, SharedRef } from "../../common/entities/Ref";
import { SharingSetting } from "../../common/entities/SharingSetting";
import { ModelValidation, validateModel, ValidationError } from "../../common/entities/Validations";
import { MetadataModule } from "./MetadataModule";

export type Module = MetadataModule;
export type ModuleType = "metadata";

export interface BaseModule extends SharedRef {
    description: string;
    department: string;
    type: ModuleType;
    instance: string;
    lastPackageVersion: string;
}

export abstract class GenericModule implements BaseModule {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly department: string;
    public readonly publicAccess: string;
    public readonly userAccesses: SharingSetting[];
    public readonly userGroupAccesses: SharingSetting[];
    public readonly user: NamedRef;
    public readonly created: Date;
    public readonly lastUpdated: Date;
    public readonly lastUpdatedBy: NamedRef;
    public readonly instance: string;
    public readonly lastPackageVersion: string;
    public abstract readonly type: ModuleType;

    constructor(data: Pick<GenericModule, keyof BaseModule>) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.department = data.department;
        this.instance = data.instance;
        this.lastPackageVersion = data.lastPackageVersion;
        this.publicAccess = data.publicAccess;
        this.userAccesses = data.userAccesses;
        this.userGroupAccesses = data.userGroupAccesses;
        this.user = data.user;
        this.created = data.created;
        this.lastUpdated = data.lastUpdated;
        this.lastUpdatedBy = data.lastUpdatedBy;
    }

    public validate(filter?: string[]): ValidationError[] {
        return validateModel<GenericModule>(this, this.moduleValidations()).filter(
            ({ property }) => filter?.includes(property) ?? true
        );
    }

    public replicate(): GenericModule {
        return this.update({ name: `Copy of ${this.name}`, id: generateUid() });
    }

    public abstract update(data?: Partial<Pick<GenericModule, keyof BaseModule>>): GenericModule;
    public abstract toSyncBuilder(): SynchronizationBuilder;

    protected abstract moduleValidations: () => ModelValidation[];

    protected static buildDefaultValues = (): Pick<GenericModule, keyof BaseModule> => {
        return {
            id: generateUid(),
            name: "",
            description: "",
            department: "",
            type: "metadata",
            instance: "",
            lastPackageVersion: "",
            publicAccess: "--------",
            userAccesses: [],
            userGroupAccesses: [],
            user: {
                id: "",
                name: "",
            },
            created: new Date(),
            lastUpdated: new Date(),
            lastUpdatedBy: {
                id: "",
                name: "",
            },
        };
    };
}
