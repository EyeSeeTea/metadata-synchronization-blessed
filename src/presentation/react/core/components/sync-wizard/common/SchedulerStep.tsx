import React from "react";
import PropTypes from "prop-types";
import i18n from "../../../../../../utils/i18n";
import isValidCronExpression from "../../../../../../utils/validCronExpression";
import Dropdown from "../../dropdown/Dropdown";
import { Toggle } from "../../toggle/Toggle";
import { SyncWizardStepProps } from "../Steps";
import TextFieldOnBlur from "../../text-field-on-blur/TextFieldOnBlur";
import { SynchronizationRule } from "../../../../../../domain/rules/entities/SynchronizationRule";
import { areCronExpressionsEqual } from "../../../../../../utils/areCronExpressionsEqual";

const cronExpressions = [
    { name: i18n.t("Every day"), id: "0 0 0 ? * *" },
    { name: i18n.t("Every month"), id: "0 0 0 1 1/1 ?" },
    { name: i18n.t("Every three months"), id: "0 0 0 1 1/3 ?" },
    { name: i18n.t("Every six months"), id: "0 0 0 1 1/6 ?" },
    { name: i18n.t("Every year"), id: "0 0 0 1 1 ?" },
];

const SchedulerStep = ({ syncRule, onChange, originalSyncRule }: SyncWizardStepProps) => {
    const form = useSchedulerForm({ syncRule, onChange, originalSyncRule });
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
    originalSyncRule?: SynchronizationRule;
    onChange: (syncRule: SynchronizationRule) => void;
}) {
    const { syncRule, onChange, originalSyncRule } = options;

    const [syncRuleForm, setSyncRuleForm] = React.useState(syncRule);
    const [errors, setErrors] = React.useState<{ frequency?: string }>({});

    const setEnabled = React.useCallback(
        (ev: { target: { value: boolean } }) => {
            const syncRuleUpdated = syncRule.updateEnabled(ev.target.value);
            setSyncRuleForm(syncRuleUpdated);
            onChange(syncRuleUpdated);
        },
        [syncRule, onChange]
    );

    const setUpdateFrequency = React.useCallback(
        (value: string) => {
            const hasFrequencyChanged =
                !!originalSyncRule?.frequency && !areCronExpressionsEqual(value, originalSyncRule.frequency);

            const syncRuleNewFrequencyUpdated = syncRule.updateFrequency(value);
            const syncRuleAllUpdated =
                syncRuleNewFrequencyUpdated.updateNeedsUpdateSchedulingFrequency(hasFrequencyChanged);
            setSyncRuleForm(syncRuleAllUpdated);

            setSyncRuleForm(syncRuleAllUpdated);
            onChange(syncRuleAllUpdated);
            setErrors(prev => ({ ...prev, frequency: undefined }));
        },
        [originalSyncRule?.frequency, syncRule, onChange]
    );

    const setCronExpression = React.useCallback(
        (value: string) => {
            const isValid = !value || isValidCronExpression(value);
            const hasFrequencyChanged =
                !!originalSyncRule?.frequency && !areCronExpressionsEqual(value, originalSyncRule.frequency);

            const syncRuleNewFrequencyUpdated = syncRule.updateFrequency(value);
            const syncRuleAllUpdated =
                syncRuleNewFrequencyUpdated.updateNeedsUpdateSchedulingFrequency(hasFrequencyChanged);
            setSyncRuleForm(syncRuleAllUpdated);

            if (isValid) {
                onChange(syncRuleAllUpdated);
                setErrors(prev => ({ ...prev, frequency: undefined }));
            } else {
                setErrors({ frequency: i18n.t("Cron expression must be valid") });
            }
        },
        [originalSyncRule?.frequency, syncRule, onChange]
    );

    return { errors, setErrors, syncRuleForm, setEnabled, setUpdateFrequency, setCronExpression };
}

SchedulerStep.propTypes = {
    syncRule: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

SchedulerStep.defaultProps = {};

export default SchedulerStep;
