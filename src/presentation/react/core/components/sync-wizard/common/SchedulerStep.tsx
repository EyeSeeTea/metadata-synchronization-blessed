import React from "react";
import PropTypes from "prop-types";
import i18n from "../../../../../../locales";
import isValidCronExpression from "../../../../../../utils/validCronExpression";
import Dropdown from "../../dropdown/Dropdown";
import { Toggle } from "../../toggle/Toggle";
import { SyncWizardStepProps } from "../Steps";
import TextFieldOnBlur from "../../text-field-on-blur/TextFieldOnBlur";
import { SynchronizationRule } from "../../../../../../domain/rules/entities/SynchronizationRule";

const cronExpressions = [
    { name: i18n.t("Every day"), id: "0 0 0 ? * *" },
    { name: i18n.t("Every month"), id: "0 0 0 1 1/1 ?" },
    { name: i18n.t("Every three months"), id: "0 0 0 1 1/3 ?" },
    { name: i18n.t("Every six months"), id: "0 0 0 1 1/6 ?" },
    { name: i18n.t("Every year"), id: "0 0 0 1 1 ?" },
];

const SchedulerStep = ({ syncRule, onChange }: SyncWizardStepProps) => {
    const form = useSchedulerForm({ syncRule, onChange });
    const selectedCron = cronExpressions.find(({ id }) => id === form.syncRuleForm.frequency);

    return (
        <>
            <Toggle value={form.syncRuleForm.enabled} label={i18n.t("Enabled")} onChange={form.setEnabled} />

            <Dropdown
                value={selectedCron?.id ?? ""}
                items={cronExpressions}
                label={i18n.t("Select frequency template")}
                emptyLabel={i18n.t("<No value>")}
                style={{ width: "100%", marginTop: 20, marginBottom: 20, marginLeft: -10 }}
                onValueChange={form.setUpdateFrequency}
            />

            <TextFieldOnBlur
                value={form.syncRuleForm.frequency || ""}
                label={i18n.t("Cron expression")}
                style={{ width: "100%" }}
                onChange={form.setCronExpression}
                error={Boolean(form.errors.frequency)}
                helperText={form.errors.frequency}
            />
        </>
    );
};

function useSchedulerForm(options: {
    syncRule: SynchronizationRule;
    onChange: (syncRule: SynchronizationRule) => void;
}) {
    const { syncRule, onChange } = options;

    const [syncRuleForm, setsyncRuleForm] = React.useState(syncRule);

    const [errors, setErrors] = React.useState<{ frequency?: string }>({});

    const setEnabled = React.useCallback(
        (ev: { target: { value: boolean } }) => {
            const syncRuleUpdated = syncRule.updateEnabled(ev.target.value);
            setsyncRuleForm(syncRuleUpdated);
            onChange(syncRuleUpdated);
        },
        [syncRule, onChange]
    );

    const setUpdateFrequency = React.useCallback(
        (value: string) => {
            const syncRuleUpdated = syncRule.updateFrequency(value);
            setsyncRuleForm(syncRuleUpdated);
            onChange(syncRuleUpdated);
            setErrors(prev => ({ ...prev, frequency: undefined }));
        },
        [syncRule, onChange]
    );

    const setCronExpression = React.useCallback(
        (value: string) => {
            const isValid = !value || isValidCronExpression(value);
            const syncRuleUpdated = syncRule.updateFrequency(value);
            setsyncRuleForm(syncRuleUpdated);

            if (isValid) {
                onChange(syncRuleUpdated);
                setErrors(prev => ({ ...prev, frequency: undefined }));
            } else {
                setErrors({ frequency: i18n.t("Cron expression must be valid") });
            }
        },
        [syncRule, onChange]
    );

    return { errors, setErrors, syncRuleForm, setEnabled, setUpdateFrequency, setCronExpression };
}

SchedulerStep.propTypes = {
    syncRule: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

SchedulerStep.defaultProps = {};

export default SchedulerStep;
