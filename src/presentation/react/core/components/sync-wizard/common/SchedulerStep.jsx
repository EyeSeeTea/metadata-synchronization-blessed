import { DropDown, TextField } from "@dhis2/d2-ui-core";
import { FormBuilder } from "@dhis2/d2-ui-forms";
import PropTypes from "prop-types";
import React from "react";
import i18n from "../../../../../../locales";
import isValidCronExpression from "../../../../../../utils/validCronExpression";
import { Toggle } from "../../toggle/Toggle";

const cronExpressions = [
    { displayName: i18n.t("Every day"), id: "0 0 0 ? * *" },
    { displayName: i18n.t("Every month"), id: "0 0 0 1 1/1 ?" },
    { displayName: i18n.t("Every three months"), id: "0 0 0 1 1/3 ?" },
    { displayName: i18n.t("Every six months"), id: "0 0 0 1 1/6 ?" },
    { displayName: i18n.t("Every year"), id: "0 0 0 1 1 ?" },
];

const SchedulerStep = ({ syncRule, onChange }) => {
    const selectedCron = cronExpressions.find(({ id }) => id === syncRule.frequency);

    const updateFields = (field, value) => {
        if (field === "enabled") {
            onChange(syncRule.updateEnabled(value));
        } else if (field === "frequency" || field === "frequencyDropdown") {
            const enabled = syncRule.enabled || !!value;
            onChange(syncRule.updateFrequency(value || "").updateEnabled(enabled));
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
            value: selectedCron?.value ?? "",
            component: DropDown,
            props: {
                hintText: syncRule.readableFrequency || i18n.t("Select frequency template"),
                menuItems: cronExpressions,
                includeEmpty: true,
                emptyLabel: i18n.t("<No value>"),
                style: { width: "100%", marginTop: 20 },
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
