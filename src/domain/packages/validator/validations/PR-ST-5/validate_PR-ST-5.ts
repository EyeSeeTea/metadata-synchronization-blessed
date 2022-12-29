import _ from "lodash";
import { Program, ProgramRule, ProgramRuleAction } from "../../../../metadata/entities/MetadataEntities";
import { MetadataPackageToValidate } from "../../packageContentValidator";

// PR-ST-5. Tracked Entity Attribute associated to a program rule action MUST belong to the program/TET that the program rule is associated to.
export function validate_PR_ST_5(packageContents: MetadataPackageToValidate): string[] {
    const programs = (packageContents.programs || []) as Program[];
    const programRules = (packageContents.programRules || []) as ProgramRule[];
    const programRuleActions = (packageContents.programRuleActions || []) as ProgramRuleAction[];

    const errors: string[] = [];

    const teaInPrograms = _(programs)
        .groupBy(({ id }) => id)
        .mapValues(programs =>
            _.flatMap(
                programs,
                ({ programTrackedEntityAttributes }) =>
                    programTrackedEntityAttributes?.map(({ trackedEntityAttribute }) => trackedEntityAttribute.id) ?? []
            )
        )
        .value();

    _(programRuleActions).forEach(({ id, trackedEntityAttribute, programRule }) => {
        if (!trackedEntityAttribute) return;

        const rule = programRules.find(rule => rule.id === programRule?.id);
        if (!rule) {
            errors.push(`Program rule action ${id} is not associated to a valid program rule`);
        } else if (!teaInPrograms[rule.program?.id ?? ""]?.includes(trackedEntityAttribute?.id ?? "")) {
            errors.push(
                `PR-ST-5 Program Rule '${rule.name}' (${rule.id}) in the PR Action uses a TEA ${trackedEntityAttribute.id} that does not belong to the associated program`
            );
        }
    });

    return errors;
}
