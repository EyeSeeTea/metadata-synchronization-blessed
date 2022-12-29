import _ from "lodash";
import { ProgramRuleVariable } from "../../../../metadata/entities/MetadataEntities";
import { MetadataPackageToValidate } from "../../packageContentValidator";

// PRV-MQ-1. More than one PRV with the same name in the same program
export function validate_PRV_MQ_1(packageContents: MetadataPackageToValidate): string[] {
    const programRuleVariables = (packageContents.programRuleVariables || []) as ProgramRuleVariable[];

    const errors: string[] = [];

    _(programRuleVariables)
        .groupBy(({ program }) => program.id)
        .toPairs()
        .forEach(([program, prVariables]) => {
            const distinctNames = _.uniq(prVariables.map(prVariable => prVariable.name));

            if (distinctNames.length !== prVariables.length) {
                errors.push(`PRV-MQ-1 - In program ${program}, more than one PRV with the same name`);
            }
        });

    return errors;
}
