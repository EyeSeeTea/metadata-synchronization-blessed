import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { FormBuilder } from "@dhis2/d2-ui-forms";
import { DropDown, TextField } from "@dhis2/d2-ui-core";

import { Toggle } from "../../toggle/Toggle";
import isValidCronExpression from "../../../utils/validCronExpression";

const cronExpressions = [
    { text: i18n.t("Every week"), value: "0 0 12 ? * MON" },
    { text: i18n.t("Every two weeks"), value: "0 0 12 */15 * ?" },
    { text: i18n.t("Every month"), value: "0 0 12 1 1/1 ?" },
    { text: i18n.t("Every three months"), value: "0 0 12 1 1/3 ?" },
    { text: i18n.t("Every six months"), value: "0 0 12 1 1/6 ?" },
    { text: i18n.t("Every year"), value: "0 0 12 1 1 ?" },
];

const SchedulerStep = ({ syncRule, onChange }) => {
    const selectedCron = cronExpressions.find(cron => cron.value === syncRule.frequency) || {};

    const updateFields = (field, value) => {
        if (field === "enabled") {
            onChange(syncRule.updateEnabled(value));
        } else if (field === "frequency" || field === "frequencyDropdown") {
            onChange(syncRule.updateFrequency(value || ""));
        }
    };

    const fields = [
        {
            name: "enabled",
            value: syncRule.enabled,
            component: Toggle,
            props: {
                label: i18n.t("Enabled"),
                style: { width: "100%" },
            },
            validators: [],
        },
        {
            name: "frequencyDropdown",
            value: selectedCron.value || "",
            component: DropDown,
            props: {
                hintText: syncRule.readableFrequency || i18n.t("Select frequency"),
                menuItems: cronExpressions.map(({ text, value: id }) => ({
                    id,
                    displayName: i18n.t(text),
                })),
                includeEmpty: true,
                emptyLabel: i18n.t("Custom"),
                style: { width: "100%" },
            },
            validators: [],
        },
        {
            name: "frequency",
            value: syncRule.frequency,
            component: TextField,
            props: {
                floatingLabelText: i18n.t("Cron expression"),
                style: { width: "100%" },
                changeEvent: "onBlur",
            },
            validators: [
                {
                    message: i18n.t("Cron expression must be valid"),
                    validator(value) {
                        return !value || isValidCronExpression(value);
                    },
                },
            ],
        },
    ];

    return <FormBuilder fields={fields} onUpdateField={updateFields} />;
};

SchedulerStep.propTypes = {
    syncRule: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

SchedulerStep.defaultProps = {};

export default SchedulerStep;
