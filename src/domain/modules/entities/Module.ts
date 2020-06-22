import { generateUid } from "d2/uid";
import { SynchronizationBuilder } from "../../../types/synchronization";
import { NamedRef } from "../../common/entities/NamedRef";
import { SharedObject } from "../../common/entities/SharedObject";
import { SharingSetting } from "../../common/entities/SharingSetting";
import { ModelValidation, validateModel, ValidationError } from "../../common/entities/Validations";
import { MetadataModule } from "./modules/MetadataModule";

export type Module = MetadataModule;
export type ModuleType = "metadata";

export interface BaseModule extends SharedObject {
    description: string;
    type: ModuleType;
}

export abstract class GenericModule implements BaseModule {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly publicAccess: string;
    public readonly userAccesses: SharingSetting[];
    public readonly userGroupAccesses: SharingSetting[];
    public readonly user: NamedRef;
    public readonly created: Date;
    public readonly lastUpdated: Date;
    public readonly lastUpdatedBy: NamedRef;
    public abstract readonly type: ModuleType;

    constructor(data: Pick<GenericModule, keyof BaseModule>) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
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
            type: "metadata",
            publicAccess: "--------",
            userAccesses: [],
            userGroupAccesses: [],
            user: {
                id: "unknown",
                name: "Unknown",
            },
            created: new Date(),
            lastUpdated: new Date(),
            lastUpdatedBy: {
                id: "unknown",
                name: "Unknown",
            },
        };
    };
}
