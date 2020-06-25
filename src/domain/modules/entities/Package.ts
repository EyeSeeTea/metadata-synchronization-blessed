import { generateUid } from "d2/uid";
import semver from "semver";
import i18n from "../../../locales";
import { DatedRef, NamedRef } from "../../common/entities/Ref";
import { ModelValidation, validateModel, ValidationError } from "../../common/entities/Validations";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { Module } from "./Module";

export interface BasePackage extends DatedRef {
    description: string;
    version: string;
    dhisVersion: string;
    module: Pick<Module, "id" | "name" | "instance">;
    contents: MetadataPackage;
}

export class Package implements BasePackage {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly version: string;
    public readonly dhisVersion: string;
    public readonly module: Pick<Module, "id" | "name" | "instance">;
    public readonly contents: MetadataPackage;
    public readonly user: NamedRef;
    public readonly created: Date;
    public readonly lastUpdated: Date;
    public readonly lastUpdatedBy: NamedRef;

    constructor(data: Pick<Package, keyof BasePackage>) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.version = data.version;
        this.dhisVersion = data.dhisVersion;
        this.module = data.module;
        this.contents = data.contents;
        this.user = data.user;
        this.created = data.created;
        this.lastUpdated = data.lastUpdated;
        this.lastUpdatedBy = data.lastUpdatedBy;
    }

    public validate(filter?: string[], module?: Module): ValidationError[] {
        return [
            ...validateModel<Package>(this, this.moduleValidations()),
            ...this.validateVersion(module),
        ].filter(({ property }) => filter?.includes(property) ?? true);
    }

    static build(data?: Partial<Pick<Package, keyof BasePackage>>): Package {
        return new Package({ ...this.buildDefaultValues(), ...data });
    }

    public update(data?: Partial<Pick<Package, keyof BasePackage>>): Package {
        return Package.build({ ...this, ...data });
    }

    protected moduleValidations = (): ModelValidation[] => [
        { property: "name", validation: "hasText" },
        {
            property: "version",
            validation: "hasText",
        },
    ];

    protected static buildDefaultValues = (): Pick<Package, keyof BasePackage> => {
        return {
            id: generateUid(),
            name: "",
            description: "",
            version: "",
            dhisVersion: "",
            module: {
                id: "",
                name: "",
                instance: "",
            },
            contents: {},
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

    private validateVersion(module?: Module): ValidationError[] {
        if (!module) return [];

        const versionSemVer = semver.parse(this.version, true);

        if (!versionSemVer)
            return [
                {
                    property: "version",
                    description: i18n.t("Version is not valid"),
                    error: "version-not-valid",
                },
            ];

        if (versionSemVer.compareMain(module.lastPackageVersion ?? "1.0.0") !== 1)
            return [
                {
                    property: "version",
                    description: i18n.t("Version is too small"),
                    error: "version-too-small",
                },
            ];

        return [];
    }
}
