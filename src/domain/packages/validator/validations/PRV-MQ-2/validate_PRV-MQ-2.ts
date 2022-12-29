import _ from "lodash";
import { ProgramRuleVariable } from "../../../../metadata/entities/MetadataEntities";
import { MetadataPackageToValidate } from "../../packageContentValidator";

// PRV-MQ-2. The PRV contains unexpected characters
export function validate_PRV_MQ_2(packageContents: MetadataPackageToValidate): string[] {
    const programRuleVariables = (packageContents.programRuleVariables || []) as ProgramRuleVariable[];

    const errors: string[] = [];

    _(programRuleVariables).forEach(({ id, name }) => {
        if (!name) {
            errors.push(`Program rule variable ${id} misses name property`);
        } else if (
            _.toLower(name).includes("and") ||
            _.toLower(name).includes("or") ||
            _.toLower(name).includes("not")
        ) {
            errors.push(`PRV-MQ-2: The PRV '${name}' (${id}) contains 'and/or/not'`);
        } else if (!name.match(/^[a-zA-Z\d_\-\.\ ]+$/)) {
            errors.push(`PRV-MQ-2: The PRV '${name}' (${id}) contains unexpected characters`);
        }
    });

    return errors;
}
