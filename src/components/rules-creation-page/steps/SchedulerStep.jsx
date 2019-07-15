import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { FormControlLabel, Switch } from "@material-ui/core";
import { FormBuilder } from "@dhis2/d2-ui-forms";
import { TextField, DropDown } from "@dhis2/d2-ui-core";
import cronstrue from "cronstrue";
import isValidCronExpression from "../../../utils/validCronExpression";

const defaultExpression = "CUSTOM";
const cronExpressions = [
    { text: "EVERY_HOUR", value: "0 0 * ? * *" },
    { text: "EVERY_DAY_MIDNIGHT", value: "0 0 1 ? * *" },
    { text: "EVERY_DAY_THREE_AM", value: "0 0 3 ? * *" },
    { text: "EVERY_WEEKDAY_NOON", value: "0 0 12 ? * MON-FRI" },
    { text: "EVERY_WEEK", value: "0 0 3 ? * MON" },
];

const Toggle = ({ label, onChange, value }) => (
    <FormControlLabel
        control={
            <Switch
                onChange={e => onChange(_.set(_.clone(e), "target.value", e.target.checked))}
                checked={value}
                color="primary"
            />
        }
        label={label}
    />
);

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
                hintText: i18n.t(
                    isValidCronExpression(syncRule.frequency)
                        ? cronstrue.toString(syncRule.frequency)
                        : "Select frequency"
                ),
                menuItems: cronExpressions.map(({ text, value: id }) => ({
                    id,
                    displayName: i18n.t(text),
                })),
                includeEmpty: true,
                emptyLabel: i18n.t(defaultExpression),
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
