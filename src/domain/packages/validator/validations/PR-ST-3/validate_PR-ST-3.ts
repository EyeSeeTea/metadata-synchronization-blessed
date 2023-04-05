import _ from "lodash";
import { ProgramRule } from "../../../../metadata/entities/MetadataEntities";
import { MetadataPackageToValidate } from "../../packageContentValidator";

// PR-ST-3. Error. Program Rule without action
export function validate_PR_ST_3(packageContents: MetadataPackageToValidate): string[] {
    const programRules = (packageContents.programRules || []) as ProgramRule[];

    const errors: string[] = [];

    _(programRules).forEach(({ id, programRuleActions }) => {
        if (!programRuleActions || programRuleActions.length === 0) {
            errors.push(`PR-ST-3 Program Rule ${id} without Program Rule Action Program`);
        }
    });

    return errors;
}
