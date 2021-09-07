import { ModelValidation, validateModel, ValidationError } from "../../common/entities/Validations";
import { DataSourceMapping } from "../../mapping/entities/DataSourceMapping";
import { PackageSource } from "./PackageSource";

interface PackageImportRuleData {
    source: PackageSource;
    packageIds: string[];
    temporalPackageMappings: DataSourceMapping[];
}

export class PackageImportRule {
    public readonly source: PackageSource;
    public readonly packageIds: string[];
    public readonly temporalPackageMappings: DataSourceMapping[];

    constructor(private data: PackageImportRuleData) {
        this.source = data.source;
        this.packageIds = data.packageIds;
        this.temporalPackageMappings = data.temporalPackageMappings;
    }

    static create(source: PackageSource, selectedPackagesId?: string[]): PackageImportRule {
        return new PackageImportRule({
            source,
            packageIds: selectedPackagesId || [],
            temporalPackageMappings: [],
        });
    }

    public updateSource(source: PackageSource): PackageImportRule {
        return PackageImportRule.create(source);
    }

    public updatePackageIds(packageIds: string[]): PackageImportRule {
        return new PackageImportRule({ ...this.data, packageIds });
    }

    public addOrUpdateTemporalPackageMapping(temporalPackageMapping: DataSourceMapping): PackageImportRule {
        if (this.temporalPackageMappings.find(mappingTemp => mappingTemp.id === temporalPackageMapping.id)) {
            return new PackageImportRule({
                ...this.data,
                temporalPackageMappings: this.data.temporalPackageMappings.map(existed =>
                    existed.id === temporalPackageMapping.id ? temporalPackageMapping : existed
                ),
            });
        } else {
            return new PackageImportRule({
                ...this.data,
                temporalPackageMappings: [...this.data.temporalPackageMappings, temporalPackageMapping],
            });
        }
    }

    public validate(filter?: string[]): ValidationError[] {
        return validateModel<PackageImportRule>(this, this.validations()).filter(
            ({ property }) => filter?.includes(property) ?? true
        );
    }

    private validations = (): ModelValidation[] => [
        {
            property: "packageIds",
            validation: "hasItems",
            alias: "package element",
        },
    ];
}
