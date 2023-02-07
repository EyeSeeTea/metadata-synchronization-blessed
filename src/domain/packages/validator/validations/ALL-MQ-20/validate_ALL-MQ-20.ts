import { ProgramIndicator, ProgramRule, ProgramRuleAction } from "../../../../metadata/entities/MetadataEntities";
import { MetadataPackageToValidate } from "../../packageContentValidator";

const stopWords = ["program_stage_name"];
const piProperties: (keyof ProgramIndicator)[] = ["filter", "expression"];
const prProperties: (keyof ProgramRule)[] = ["condition"];
const praProperties: (keyof ProgramRuleAction)[] = ["data"];

// ALL-MQ-20. A resource (programIndicators, programRules, programRuleActions) contains a 'program_stage_name'
export function validate_ALL_MQ_20(packageContents: MetadataPackageToValidate): string[] {
    const programIndicators = (packageContents.programIndicators || []) as ProgramIndicator[];
    const programRules = (packageContents.programRules || []) as ProgramRule[];
    const programRuleActions = (packageContents.programRuleActions || []) as ProgramRuleAction[];

    const programIndicatorErrors = piProperties
        .map(prop => {
            return programIndicators
                .filter(pi => stopWords.some(word => pi[prop] && pi[prop].toString().includes(word)))
                .map(
                    pi =>
                        `ALL-MQ-20 From program '${pi.program.id}', the PI '${pi.name}' (${pi.id}) contains 'program_stage_name' in the ${prop}.`
                );
        })
        .flat();

    const programRulesErrors = prProperties
        .map(prop => {
            return programRules
                .filter(pr => stopWords.some(word => pr[prop] && pr[prop].toString().includes(word)))
                .map(
                    pr =>
                        `ALL-MQ-20 From program '${pr.program.id}', the PR '${pr.name}' (${pr.id}) contains 'program_stage_name' in the ${prop}.`
                );
        })
        .flat();

    const programRuleActionsErrors = praProperties
        .map(prop => {
            return programRuleActions
                .filter(pra => stopWords.some(word => pra[prop] && pra[prop].toString().includes(word)))
                .map(
                    pra =>
                        `ALL-MQ-20 From programRule '${pra.programRule.id}', the PRA '${pra.name}' (${pra.id}) contains 'program_stage_name' in the ${prop}.`
                );
        })
        .flat();

    return [...programIndicatorErrors, ...programRulesErrors, ...programRuleActionsErrors];
}
