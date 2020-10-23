import { ModelValidation, validateModel, ValidationError } from "../../common/entities/Validations";
import { MetadataMappingDictionary } from "../../instance/entities/MetadataMapping";
import { PackageSource } from "./PackageSource";

interface PackageImportRuleData {
    source: PackageSource;
    packageIds: string[];
    mappingByPackageId: Record<string, MetadataMappingDictionary>;
}

export class PackageImportRule {
    public readonly source: PackageSource;
    public readonly packageIds: string[];
    public readonly mappingByPackageId: Record<string, MetadataMappingDictionary>;

    constructor(private data: PackageImportRuleData) {
        this.source = data.source;
        this.packageIds = data.packageIds;
        this.mappingByPackageId = data.mappingByPackageId;
    }

    static create(source: PackageSource): PackageImportRule {
        return new PackageImportRule({ source, packageIds: [], mappingByPackageId: {} });
    }

    public updatePackageIds(packageIds: string[]): PackageImportRule {
        return new PackageImportRule({ ...this.data, packageIds });
    }

    public updateMappingsByPackageId(
        mappingByPackageId: Record<string, MetadataMappingDictionary>
    ): PackageImportRule {
        return new PackageImportRule({ ...this.data, mappingByPackageId });
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
