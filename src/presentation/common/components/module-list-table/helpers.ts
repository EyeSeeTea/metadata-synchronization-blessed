import _ from "lodash";
import { ValidationError } from "../../../../domain/common/entities/Validations";
import { SnackbarLevel } from "d2-ui-components";
import i18n from "../../../../locales";

export function getValidationsByVersionFeedback(
    validationsByVersion: _.Dictionary<ValidationError[]>
): [SnackbarLevel, string] {
    const successVersions = _(validationsByVersion)
        .pickBy(validations => _.isEmpty(validations))
        .keys()
        .value();

    const errorVersions = _(validationsByVersion)
        .pickBy(validations => !_.isEmpty(validations))
        .keys()
        .value();

    const msg = _.compact([
        successVersions.length > 0
            ? i18n.t("{{n}} package(s) created successfully: {{list}}", {
                  n: successVersions.length,
                  list: successVersions.join(", "),
                  nsSeparator: false,
              })
            : null,
        errorVersions.length > 0
            ? i18n.t("{{n}} package(s) could not be created: {{list}}", {
                  n: errorVersions.length,
                  list: errorVersions.join(", "),
                  nsSeparator: false,
              })
            : null,
        ..._(validationsByVersion)
            .toPairs()
            .sortBy(([version, _validations]) => version)
            .flatMap(([version, validations]) =>
                validations.map(v => `[${version}] ${v.description}`)
            )
            .value(),
    ]).join("\n");

    const level = _.isEmpty(errorVersions)
        ? "success"
        : _.isEmpty(successVersions)
        ? "error"
        : "warning";

    return [level, msg];
}
