import { extractParentsFromRule, extractChildrenFromRules } from "../metadataIncludeExclude";

describe("extractParentsFromRule", () => {
    it("should return empty array if does not exist parent", () => {
        const rule = "organisationUnitGroups";
        const expectedParents = [];
        expect(extractParentsFromRule(rule)).toEqual(expectedParents);
    });
    it("should return a parent if rule has one parent", () => {
        const rule = "organisationUnitGroups.organisationUnitGroupSets";
        const expectedParents = ["organisationUnitGroups"];

        expect(extractParentsFromRule(rule)).toEqual(expectedParents);
    });
    it("should return parents if rule has parents", () => {
        const rule = "organisationUnitGroups.organisationUnitGroupSets.attributes";
        const expectedParents = ["organisationUnitGroups.organisationUnitGroupSets", "organisationUnitGroups"];

        expect(extractParentsFromRule(rule)).toEqual(expectedParents);
    });
    it("should return children if rules contain children", () => {
        const rule = "organisationUnitGroups";
        const rules = [
            "attributes",
            "organisationUnitGroups",
            "organisationUnitGroups.organisationUnitGroupSets",
            "organisationUnitGroups.organisationUnitGroupSets.attributes",
        ];
        const expectedChildren = [
            "organisationUnitGroups.organisationUnitGroupSets",
            "organisationUnitGroups.organisationUnitGroupSets.attributes",
        ];

        expect(extractChildrenFromRules(rule, rules)).toEqual(expectedChildren);
    });
    it("should return empty children if rules does not contain children", () => {
        const rule = "attributes";
        const rules = [
            "attributes",
            "organisationUnitGroups",
            "organisationUnitGroups.organisationUnitGroupSets",
            "organisationUnitGroups.organisationUnitGroupSets.attributes",
        ];
        const expectedChildren = [];

        expect(extractChildrenFromRules(rule, rules)).toEqual(expectedChildren);
    });
});

export {};
