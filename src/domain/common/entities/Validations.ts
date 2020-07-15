import _ from "lodash";
import i18n from "../../../locales";

export interface ValidationError {
    property: string;
    description: string;
    error: string;
}

export interface ModelValidation {
    property: string;
    alias?: string;
    validation: keyof typeof availableValidations;
}

const availableValidations = {
    hasText: {
        error: "cannot_be_blank",
        getDescription: (field: string) => i18n.t("Field {{field}} cannot be blank", { field }),
        check: (value: string) => !value.trim(),
    },
    hasItems: {
        error: "cannot_be_empty",
        getDescription: (field: string) =>
            i18n.t("You need to select at least one {{field}}", { field }),
        check: (array: unknown[]) => !array || array.length === 0,
    },
};

export function validateModel<T>(item: T, validations: ModelValidation[]): ValidationError[] {
    return validations.reduce(
        (acc: ValidationError[], { property, validation, alias }: ModelValidation) => {
            const { check, error, getDescription } = availableValidations[validation];
            const value = _.get(item, property);
            const description = getDescription(alias ?? property);

            if (check(value)) acc.push({ property, description, error });

            return acc;
        },
        [] as ValidationError[]
    );
}
