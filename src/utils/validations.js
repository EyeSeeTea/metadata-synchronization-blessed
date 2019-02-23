import _ from "lodash";
import i18n from "@dhis2/d2-i18n";

const translations = {
    cannot_be_blank: namespace => i18n.t("Field {{field}} cannot be blank", namespace),
    cannot_be_blank_if_other_set: namespace =>
        i18n.t("Field {{field}} cannot be blank if field {{other}} is set", namespace)
};

export function getValidationMessages(campaign, validationKeys) {
    const validationObj = campaign.validate();

    return _(validationObj)
        .at(validationKeys)
        .flatten()
        .compact()
        .map(error => {
            const translation = translations[error.key];
            if (translation) {
                return i18n.t(translation(error.namespace));
            } else {
                return `Missing translations: ${error.key}`;
            }
        })
        .value();
}
