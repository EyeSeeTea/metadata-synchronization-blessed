import _ from "lodash";

export interface ValidationError {
    property: string;
    alias?: string;
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
        check: (value: string) => !value.trim(),
    },
    hasItems: {
        error: "cannot_be_empty",
        check: (array: unknown[]) => !array || array.length === 0,
    },
};

export function validateModel<T>(item: T, validations: ModelValidation[]): ValidationError[] {
    return validations.reduce(
        (acc: ValidationError[], { property, validation, alias }: ModelValidation) => {
            const { check, error } = availableValidations[validation];
            const value = _.get(item, property);

            if (check(value)) acc.push({ property, alias, error });

            return acc;
        },
        [] as ValidationError[]
    );
}
