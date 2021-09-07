import _ from "lodash";
import { D2Model } from "../../../models/dhis/default";
import { extractChildrenFromRules, extractParentsFromRule } from "../../../utils/metadataIncludeExclude";
import { ModelValidation } from "../../common/entities/Validations";
import { ExcludeIncludeRules, MetadataIncludeExcludeRules } from "../../metadata/entities/MetadataExcludeIncludeRules";
import { SynchronizationBuilder } from "../../synchronization/entities/SynchronizationBuilder";
import { BaseModule, GenericModule } from "./Module";

interface BaseMetadataModule extends BaseModule {
    type: "metadata";
    metadataIds: string[];
    excludedIds: string[];
    includeUserInformation: boolean;
    removeOrgUnitReferences: boolean;
    useDefaultIncludeExclude: boolean;
    metadataIncludeExcludeRules?: MetadataIncludeExcludeRules;
}

export class MetadataModule extends GenericModule implements BaseMetadataModule {
    public readonly metadataIds: string[];
    public readonly excludedIds: string[];
    public readonly includeUserInformation: boolean;
    public readonly removeOrgUnitReferences: boolean;
    public readonly useDefaultIncludeExclude: boolean;
    public readonly metadataIncludeExcludeRules: MetadataIncludeExcludeRules;
    public readonly type = "metadata";

    constructor(data: Pick<MetadataModule, keyof BaseMetadataModule>) {
        super(data);
        this.metadataIds = data.metadataIds;
        this.excludedIds = data.excludedIds;
        this.includeUserInformation = data.includeUserInformation;
        this.removeOrgUnitReferences = data.removeOrgUnitReferences;
        this.useDefaultIncludeExclude = data.useDefaultIncludeExclude;
        this.metadataIncludeExcludeRules = data.metadataIncludeExcludeRules;
    }

    static build(data?: Partial<Pick<MetadataModule, keyof BaseMetadataModule>>): MetadataModule {
        return new MetadataModule({ ...this.buildDefaultValues(), ...data });
    }

    public update(data?: Partial<Pick<MetadataModule, keyof MetadataModule>>): MetadataModule {
        return MetadataModule.build({ ...this, ...data });
    }

    public toSyncBuilder(): Omit<SynchronizationBuilder, "originInstance" | "targetInstances"> {
        return {
            metadataIds: this.metadataIds,
            filterRules: [],
            excludedIds: this.excludedIds,
            syncParams: {
                enableMapping: true,
                removeOrgUnitReferences: this.removeOrgUnitReferences,
                includeSharingSettings: this.includeUserInformation,
                useDefaultIncludeExclude: this.useDefaultIncludeExclude,
                metadataIncludeExcludeRules: this.metadataIncludeExcludeRules,
            },
        };
    }

    public markToUseDefaultIncludeExclude(): MetadataModule {
        return this.update({ useDefaultIncludeExclude: true, metadataIncludeExcludeRules: {} });
    }

    public markToNotUseDefaultIncludeExclude(models: Array<typeof D2Model>): MetadataModule {
        const metadataIncludeExcludeRules: MetadataIncludeExcludeRules = models.reduce(
            (accumulator: any, model: typeof D2Model) => ({
                ...accumulator,
                [model.getMetadataType()]: {
                    includeRules: model.getIncludeRules().map(array => array.join(".")),
                    excludeRules: model.getExcludeRules().map(array => array.join(".")),
                },
            }),
            {}
        );

        return this.update({ useDefaultIncludeExclude: false, metadataIncludeExcludeRules });
    }

    public moveRuleFromExcludeToInclude(type: string, rulesToInclude: string[]): MetadataModule {
        const { includeRules: oldIncludeRules, excludeRules: oldExcludeRules } = this.metadataIncludeExcludeRules[type];

        if (_.difference(rulesToInclude, oldExcludeRules).length > 0) {
            throw Error("Rules error: It's not possible move rules that do not exist in exclude to include");
        }

        const rulesToIncludeWithParents = _(rulesToInclude)
            .map(extractParentsFromRule)
            .flatten()
            .union(rulesToInclude)
            .uniq()
            .value();

        const excludeIncludeRules = {
            includeRules: _.uniq([...oldIncludeRules, ...rulesToIncludeWithParents]),
            excludeRules: oldExcludeRules.filter(rule => !rulesToIncludeWithParents.includes(rule)),
        };

        return this.updateIncludeExcludeRules(type, excludeIncludeRules);
    }

    public moveRuleFromIncludeToExclude(type: string, rulesToExclude: string[]): MetadataModule {
        const { includeRules: oldIncludeRules, excludeRules: oldExcludeRules } = this.metadataIncludeExcludeRules[type];

        if (_.difference(rulesToExclude, oldIncludeRules).length > 0) {
            throw Error("Rules error: It's not possible move rules that do not exist in include to exclude");
        }

        const rulesToExcludeWithChildren = _(rulesToExclude)
            .map(rule => extractChildrenFromRules(rule, oldIncludeRules))
            .flatten()
            .union(rulesToExclude)
            .uniq()
            .value();

        const excludeIncludeRules = {
            includeRules: oldIncludeRules.filter(rule => !rulesToExcludeWithChildren.includes(rule)),
            excludeRules: [...oldExcludeRules, ...rulesToExcludeWithChildren],
        };

        return this.updateIncludeExcludeRules(type, excludeIncludeRules);
    }

    protected moduleValidations = (): ModelValidation[] => [
        { property: "name", validation: "hasText" },
        { property: "department", validation: "validRef" },
        {
            property: "metadataIds",
            validation: "hasItems",
            alias: "metadata element",
        },
    ];

    protected static buildDefaultValues = (): Pick<MetadataModule, keyof BaseMetadataModule> => {
        return {
            ...GenericModule.buildDefaultValues(),
            metadataIds: [],
            excludedIds: [],
            removeOrgUnitReferences: false,
            includeUserInformation: false,
            useDefaultIncludeExclude: true,
            metadataIncludeExcludeRules: {},
        };
    };

    private updateIncludeExcludeRules(type: string, excludeIncludeRules: ExcludeIncludeRules): MetadataModule {
        const metadataIncludeExcludeRules = {
            ...this.metadataIncludeExcludeRules,
            [type]: excludeIncludeRules,
        };

        return this.update({ metadataIncludeExcludeRules });
    }
}
