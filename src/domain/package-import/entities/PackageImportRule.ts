import { ModelValidation, validateModel, ValidationError } from "../../common/entities/Validations";
import { Instance } from "../../instance/entities/Instance";
import { MetadataMappingDictionary } from "../../instance/entities/MetadataMapping";

interface PackageImportRuleData {
    instance: Instance;
    packageIds: string[];
    mappingByPackageId: Record<string, MetadataMappingDictionary>;
}

export class PackageImportRule {
    public readonly instance: Instance;
    public readonly packageIds: string[];
    public readonly mappingByPackageId: Record<string, MetadataMappingDictionary>;

    constructor(private data: PackageImportRuleData) {
        this.instance = data.instance;
        this.packageIds = data.packageIds;
        this.mappingByPackageId = data.mappingByPackageId;
    }

    static create(instance: Instance): PackageImportRule {
        return new PackageImportRule({ instance, packageIds: [], mappingByPackageId: {} });
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
