import { MetadataPackageToValidate } from "../../packageContentValidator";
import { resourcesWithCode } from "../../utils";

// # ALL-MQ-18: Codes MUST be upper case ASCII (alphabetic A-Z), and the symbols '_' (underscore),'-' (hyphen),'.' (dot),'|' (Bar o Pipe)
export function validate_ALL_MQ_18(packageContents: MetadataPackageToValidate): string[] {
    const PATTERN_OPTION_CODE = /^([0-9A-Z_\|\-\.]+)+$/;
    const PATTERN_CODE = /^([0-9A-Z_]+)+$/;

    const optionErrors =
        packageContents.options
            ?.filter(item => !PATTERN_OPTION_CODE.test(item.code || "") || item.code?.includes("\n"))
            .map(
                item =>
                    `ALL-MQ-18- Invalid code='${item.code}' (resource type='options' (name='${item.name}' uid=${item.id})`
            ) || [];

    const restErrors = resourcesWithCode
        .filter(key => key !== "options")
        .map(key => {
            return (
                packageContents[key]
                    ?.filter(item => !PATTERN_CODE.test(item.code || "") || item.code?.includes("\n"))
                    .map(
                        item =>
                            `ALL-MQ-18- Invalid code='${item.code}' (resource type='${key}' (name='${item.name}' uid=${item.id})`
                    ) || []
            );
        })
        .flat();

    return [...optionErrors, ...restErrors];
}
