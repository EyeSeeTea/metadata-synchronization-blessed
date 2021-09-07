import _ from "lodash";
import i18n from "../../../locales";
import { Ref } from "./Ref";

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

// Diego Perini (License: MIT)
const urlRegExp =
    /^(?:(?:https?:\/\/)?localhost(?::\d{2,5})?)$|(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;

const availableValidations = {
    hasText: {
        error: "cannot_be_blank",
        getDescription: (field: string) => i18n.t("Field {{field}} cannot be blank", { field }),
        check: (value?: string) => !value?.trim(),
    },
    hasValue: {
        error: "cannot_be_blank",
        getDescription: (field: string) => i18n.t("Field {{field}} cannot be blank", { field }),
        check: (value?: string) => !value,
    },
    hasItems: {
        error: "cannot_be_empty",
        getDescription: (field: string) => i18n.t("You need to select at least one {{field}}", { field }),
        check: (array?: unknown[]) => !array || array.length === 0,
    },
    isUrl: {
        error: "invalid_url",
        getDescription: (field: string) => i18n.t("Field {{field}} needs to be a valid url", { field }),
        check: (value?: string) => !value?.trim() || !urlRegExp.test(value),
    },
    validRef: {
        error: "invalid_url",
        getDescription: (field: string) => i18n.t("Field {{field}} is not valid", { field }),
        check: (value?: Ref) => !value?.id,
    },
};

export function validateModel<T>(item: T, validations: ModelValidation[]): ValidationError[] {
    return validations.reduce((acc: ValidationError[], { property, validation, alias }: ModelValidation) => {
        const { check, error, getDescription } = availableValidations[validation];
        const value = _.get(item, property);
        const description = getDescription(alias ?? property);

        if (check(value)) acc.push({ property, description, error });

        return acc;
    }, [] as ValidationError[]);
}
