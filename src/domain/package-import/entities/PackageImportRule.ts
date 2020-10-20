import { ModelValidation, validateModel, ValidationError } from "../../common/entities/Validations";
import { Instance } from "../../instance/entities/Instance";

interface PackageImportRuleData {
    instance: Instance;
    packageIds: string[];
}

export class PackageImportRule {
    public readonly instance: Instance;
    public readonly packageIds: string[];

    constructor(private data: PackageImportRuleData) {
        this.instance = data.instance;
        this.packageIds = data.packageIds;
    }

    static create(instance: Instance): PackageImportRule {
        return new PackageImportRule({ instance, packageIds: [] });
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
