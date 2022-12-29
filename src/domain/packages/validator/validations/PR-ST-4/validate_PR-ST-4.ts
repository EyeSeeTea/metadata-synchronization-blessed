import _ from "lodash";
import { ProgramRule, ProgramRuleAction, ProgramStage } from "../../../../metadata/entities/MetadataEntities";
import { MetadataPackageToValidate } from "../../packageContentValidator";

// PR-ST-4. Program Rule has a PR Action that uses a DE that does not belong to the associated program.
export function validate_PR_ST_4(packageContents: MetadataPackageToValidate): string[] {
    const programStages = (packageContents.programStages || []) as ProgramStage[];
    const programRules = (packageContents.programRules || []) as ProgramRule[];
    const programRuleActions = (packageContents.programRuleActions || []) as ProgramRuleAction[];

    const errors: string[] = [];

    const dataElementsInPrograms = _(programStages)
        .groupBy(({ program }) => program?.id)
        .mapValues(programStages =>
            _.flatMap(
                programStages,
                ({ programStageDataElements }) =>
                    programStageDataElements?.map(({ dataElement }) => dataElement.id) ?? []
            )
        )
        .value();

    _(programRuleActions).forEach(({ id, dataElement, programRule }) => {
        if (!dataElement) return;

        const rule = programRules.find(rule => rule.id === programRule?.id);
        if (!rule) {
            errors.push(`Program rule action ${id} is not associated to a valid program rule`);
        } else if (!dataElementsInPrograms[rule.program?.id ?? ""]?.includes(dataElement?.id ?? "")) {
            errors.push(
                `PR-ST-4 Program Rule '${rule.name}' (${rule.id}) in the PR Action uses a DE ${dataElement.id} that does not belong to the associated program`
            );
        }
    });

    return errors;
}
