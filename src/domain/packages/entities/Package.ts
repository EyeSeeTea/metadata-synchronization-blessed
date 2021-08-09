import { generateUid } from "d2/uid";
import _ from "lodash";
import semver from "semver";
import i18n from "../../../locales";
import { DatedRef, NamedRef } from "../../common/entities/Ref";
import { ModelValidation, validateModel, ValidationError } from "../../common/entities/Validations";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { BaseModule, Module } from "../../modules/entities/Module";

export interface BasePackage extends DatedRef {
    deleted?: boolean;
    description: string;
    version: string;
    dhisVersion: string;
    module: Pick<BaseModule, "id" | "name" | "instance" | "department">;
    contents: MetadataPackage;
}

export type ListPackage = Omit<BasePackage, "contents">;

export class Package implements BasePackage {
    public readonly id: string;
    public readonly name: string;
    public readonly deleted: boolean;
    public readonly description: string;
    public readonly version: string;
    public readonly dhisVersion: string;
    public readonly module: Pick<BaseModule, "id" | "name" | "instance" | "department">;
    public readonly contents: MetadataPackage;
    public readonly user: NamedRef;
    public readonly created: Date;
    public readonly lastUpdated: Date;
    public readonly lastUpdatedBy: NamedRef;

    constructor(data: Pick<Package, keyof BasePackage>) {
        this.id = data.id;
        this.name = data.name;
        this.deleted = data.deleted;
        this.description = data.description;
        this.version = data.version;
        this.dhisVersion = data.dhisVersion;
        this.module = _.pick(data.module, ["id", "name", "instance", "department"]);
        this.contents = data.contents;
        this.user = _.pick(data.user, ["id", "name"]);
        this.created = new Date(data.created);
        this.lastUpdated = new Date(data.lastUpdated);
        this.lastUpdatedBy = _.pick(data.lastUpdatedBy, ["id", "name"]);
    }

    public validate(filter?: string[], module?: Module): ValidationError[] {
        return [...validateModel<Package>(this, this.moduleValidations()), ...this.validateVersion(module)].filter(
            ({ property }) => filter?.includes(property) ?? true
        );
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
            name: "-",
            deleted: false,
            description: "",
            version: "",
            dhisVersion: "",
            module: {
                id: "",
                name: "-",
                instance: "",
                department: {
                    id: "",
                    name: "",
                },
            },
            contents: {},
            user: {
                id: "",
                name: "-",
            },
            created: new Date(),
            lastUpdated: new Date(),
            lastUpdatedBy: {
                id: "",
                name: "-",
            },
        };
    };

    private validateVersion(module?: Module): ValidationError[] {
        if (!module) return [];

        const versionSemVer = semver.parse(this.version.split("-")[0]);
        const lastVersion = module.lastPackageVersion.split("-")[0];
        const validExample = semver.inc(lastVersion, "patch") ?? "1.0.0";

        if (!versionSemVer)
            return [
                {
                    property: "version",
                    description: i18n.t("Version is not valid (ie. {{validExample}})", {
                        validExample,
                    }),
                    error: "version-not-valid",
                },
            ];

        if (module.lastPackageVersion && versionSemVer.compareMain(lastVersion) !== 1) {
            return [
                {
                    property: "version",
                    description: i18n.t("Version is too small (next version is {{validExample}})", {
                        validExample,
                    }),
                    error: "version-too-small",
                },
            ];
        }

        return [];
    }

    toRef(): NamedRef {
        return { id: this.id, name: this.name };
    }
}
