import { ModelValidation, validateModel, ValidationError } from "../../common/entities/Validations";
import { PackageSource } from "./PackageSource";

interface PackageImportRuleData {
    source: PackageSource;
    packageIds: string[];
}

export class PackageImportRule {
    public readonly source: PackageSource;
    public readonly packageIds: string[];

    constructor(private data: PackageImportRuleData) {
        this.source = data.source;
        this.packageIds = data.packageIds;
    }

    static create(source: PackageSource, selectedPackagesId?: string[]): PackageImportRule {
        return new PackageImportRule({
            source,
            packageIds: selectedPackagesId || [],
        });
    }

    public updateSource(source: PackageSource): PackageImportRule {
        return PackageImportRule.create(source);
    }

    public updatePackageIds(packageIds: string[]): PackageImportRule {
        return new PackageImportRule({ ...this.data, packageIds });
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
