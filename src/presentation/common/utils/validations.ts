import { ValidationError } from "../../../domain/common/entities/Validations";
import i18n from "../../../locales";

export function parseValidationMessages(errors: ValidationError[]): string[] {
    return errors.map(({ property, error, alias }) => {
        const namespace = { error, field: alias ?? property };

        switch (error) {
            case "cannot_be_blank":
                return i18n.t("Field {{field}} cannot be blank", namespace);
            case "cannot_be_empty":
                return i18n.t("You need to select at least one {{field}}", namespace);
            default:
                return i18n.t("Unknown error {{error}} on {{field}}", namespace);
        }
    });
}
