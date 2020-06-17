import { MetadataIncludeExcludeRules } from "../../../types/synchronization";
import { NamedRef } from "../../common/entities/NamedRef";
import { SharedObject } from "../../common/entities/SharedObject";
import { SharingSetting } from "../../common/entities/SharingSetting";
import { ModelValidation, validateModel, ValidationError } from "../../common/entities/Validations";
import { generateUid } from "d2/uid";

export type ModuleType = "metadata";

interface BaseModule extends SharedObject {
    description: string;
    type: ModuleType;
}

export interface MetadataModule extends BaseModule {
    type: "metadata";
    metadataIds: string[];
    useDefaultIncludeExclude: boolean;
    metadataIncludeExcludeRules?: MetadataIncludeExcludeRules;
}

export class Module implements MetadataModule {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly type: "metadata";
    public readonly publicAccess: string;
    public readonly userAccesses: SharingSetting[];
    public readonly userGroupAccesses: SharingSetting[];
    public readonly user: NamedRef;
    public readonly lastUpdated: Date;
    public readonly lastUpdatedBy: NamedRef;
    public readonly metadataIds: string[];
    public readonly useDefaultIncludeExclude: boolean;
    public readonly metadataIncludeExcludeRules: MetadataIncludeExcludeRules;

    constructor(data: Pick<Module, keyof MetadataModule>) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.type = data.type;
        this.publicAccess = data.publicAccess;
        this.userAccesses = data.userAccesses;
        this.userGroupAccesses = data.userGroupAccesses;
        this.user = data.user;
        this.lastUpdated = data.lastUpdated;
        this.lastUpdatedBy = data.lastUpdatedBy;
        this.metadataIds = data.metadataIds;
        this.useDefaultIncludeExclude = data.useDefaultIncludeExclude;
        this.metadataIncludeExcludeRules = data.metadataIncludeExcludeRules;
    }

    static build(data?: Partial<Pick<Module, keyof MetadataModule>>) {
        return new Module({
            ...this.defaultValues,
            ...data,
        });
    }

    public validate(filter?: string[]): ValidationError[] {
        return validateModel<Module>(this, this.moduleValidations).filter(
            ({ property }) => filter?.includes(property) ?? true
        );
    }

    private moduleValidations: ModelValidation[] = [
        { property: "name", validation: "hasText" },
        {
            property: "metadataIds",
            validation: "hasItems",
            alias: "metadata element",
        },
    ];

    private static defaultValues: Pick<Module, keyof MetadataModule> = {
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
        lastUpdated: new Date(),
        lastUpdatedBy: {
            id: "unknown",
            name: "Unknown",
        },
        metadataIds: [],
        useDefaultIncludeExclude: true,
        metadataIncludeExcludeRules: {},
    };
}
