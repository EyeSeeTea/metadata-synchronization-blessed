import { makeStyles, TextField } from "@material-ui/core";
import React, { useCallback, useMemo, useState } from "react";
import { Instance } from "../../../../../../domain/instance/entities/Instance";
import { SynchronizationRule } from "../../../../../../domain/rules/entities/SynchronizationRule";
import { Store } from "../../../../../../domain/stores/entities/Store";
import i18n from "../../../../../../utils/i18n";
import { Dictionary } from "../../../../../../types/utils";
import { getValidationMessages } from "../../../../../../utils/old-validations";
import {
    InstanceSelectionDropdown,
    InstanceSelectionOption,
} from "../../instance-selection-dropdown/InstanceSelectionDropdown";
import { SyncWizardStepProps } from "../Steps";
import Dropdown from "../../dropdown/Dropdown";

export const GeneralInfoStep = ({ syncRule, onChange }: SyncWizardStepProps) => {
    const classes = useStyles();

    const [errors, setErrors] = useState<Dictionary<string>>({});

    const onChangeField = useCallback(
        (field: keyof SynchronizationRule) => {
            return (event: React.ChangeEvent<{ value: unknown }>) => {
                const newRule = syncRule.update({ [field]: event.target.value });
                const messages = getValidationMessages(newRule, [field]);

                setErrors(errors => ({ ...errors, [field]: messages.join("\n") }));
                onChange(newRule);
            };
        },
        [syncRule, onChange]
    );

    const onChangeInstance = useCallback(
        (_type: InstanceSelectionOption, instance?: Instance | Store) => {
            const originInstance = instance?.id ?? "LOCAL";
            const targetInstances = originInstance === "LOCAL" ? [] : ["LOCAL"];

            onChange(
                syncRule
                    .updateBuilder({ originInstance })
                    .updateTargetInstances(targetInstances)
                    .updateMetadataIds([])
                    .updateExcludedIds([])
            );
        },
        [syncRule, onChange]
    );

    const onChangeUseAggregatedDataExchange = useCallback(
        (event: React.ChangeEvent<{ value: unknown }>) => {
            const useAggregatedDataExchange = event.target.value === "dataExchange";

            const newRule = syncRule.updateUseAggregatedDataExchange(useAggregatedDataExchange);

            onChange(newRule);
        },
        [syncRule, onChange]
    );

    const useAggregatedDataExchange = useMemo(() => {
        return syncRule.useAggregatedDataExchange ? "dataExchange" : "default";
    }, [syncRule.useAggregatedDataExchange]);

    return (
        <React.Fragment>
            <TextField
                className={classes.row}
                fullWidth={true}
                label={i18n.t("Name (*)")}
                value={syncRule.name ?? ""}
                onChange={onChangeField("name")}
                error={!!errors["name"]}
                helperText={errors["name"]}
            />

            <TextField
                className={classes.row}
                fullWidth={true}
                label={i18n.t("Code")}
                value={syncRule.code ?? ""}
                onChange={onChangeField("code")}
                error={!!errors["code"]}
                helperText={errors["code"]}
            />

            {(syncRule.type === "aggregated" || syncRule.type === "events") && (
                <div className={classes.row}>
                    <Dropdown
                        items={[
                            { id: "default", name: i18n.t("Default") },
                            { id: "dataExchange", name: i18n.t("Aggregated data exchange ") },
                        ]}
                        value={useAggregatedDataExchange}
                        onChange={onChangeUseAggregatedDataExchange}
                        label={i18n.t("Type of synchronization")}
                        hideEmpty={true}
                        view="full-width"
                    />
                </div>
            )}

            <div className={classes.row}>
                <InstanceSelectionDropdown
                    showInstances={{ local: true, remote: !syncRule.useAggregatedDataExchange }}
                    selectedInstance={syncRule.originInstance}
                    onChangeSelected={onChangeInstance}
                    view="full-width"
                    title={i18n.t("Source instance")}
                />
            </div>

            <TextField
                className={classes.row}
                fullWidth={true}
                multiline={true}
                rows={4}
                label={i18n.t("Description")}
                value={syncRule.description ?? ""}
                onChange={onChangeField("description")}
                error={!!errors["description"]}
                helperText={errors["description"]}
            />
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    row: {
        marginBottom: 25,
    },
});

export default GeneralInfoStep;
