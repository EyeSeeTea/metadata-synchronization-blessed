import _ from "lodash";
import { OptionGroup, OptionSet } from "../../../../metadata/entities/MetadataEntities";
import { MetadataPackageToValidate } from "../../packageContentValidator";

// OG-MQ-1. All options in optionGroups must belong to an optionSet
export function validate_OG_MQ_1(packageContents: MetadataPackageToValidate): string[] {
    const optionGroups = (packageContents.optionGroups || []) as OptionGroup[];
    const optionSets = (packageContents.optionSets || []) as OptionSet[];

    const errors: string[] = [];

    const optionIdsInOptionGroups = _.flatMap(optionGroups, ({ options }) => options?.map(({ id }) => id) ?? []);
    const optionIdsInOptionSets = _.flatMap(optionSets, ({ options }) => options?.map(({ id }) => id) ?? []);

    const invalidOptionIds = _.difference(optionIdsInOptionGroups, optionIdsInOptionSets);
    for (const invalidOptionId of invalidOptionIds) {
        errors.push(`OG-MQ-1 - Option in OptionGroup but not in OptionSet. Option ${invalidOptionId}`);
    }

    return errors;
}
