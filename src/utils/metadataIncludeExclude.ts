import _ from "lodash";

/**
 * Retrieve parents from rule
 * for example:
 * for input: "organisationUnitGroups"
 * return   []
 * for input: "organisationUnitGroups.organisationUnitGroupSets"
 * return   ["organisationUnitGroups"]
 * for input: "organisationUnitGroups.organisationUnitGroupSets.attributes"
 * return   ["organisationUnitGroups.organisationUnitGroupSets","organisationUnitGroups"]
 * @param rule - The rule where extract the parents
 */
export function extractParentsFromRule(rule: string): string[] {
    const parts = rule.split(".");
    return _(parts.length)
        .range(0)
        .map(index => _.take(parts, index).join("."))
        .drop(1)
        .value();
}

/**
 * Retrieve childrens of a rule in a rules array
 * For example:
 *
 * For rule organisationUnitGroups and rules
 * ["organisationUnitGroups",
 *  "organisationUnitGroups.organisationUnitGroupSets",
 *  "organisationUnitGroups.organisationUnitGroupSets.attributes]
 *
 * return
 * ["organisationUnitGroups.organisationUnitGroupSets",
 *  "organisationUnitGroups.organisationUnitGroupSets.attributes]
 *
 * if children does not exists then return empty array
 * @param rule  - Parent rule
 * @param rules - Rules where extract the children
 */
export function extractChildrenFromRules(rule: string, rules: string[]): string[] {
    return rules.filter((children: string) => children.includes(rule + "."));
}
