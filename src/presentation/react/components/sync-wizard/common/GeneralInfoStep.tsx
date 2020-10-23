import { makeStyles, TextField } from "@material-ui/core";
import React, { useCallback, useState } from "react";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import { Store } from "../../../../../domain/packages/entities/Store";
import i18n from "../../../../../locales";
import SyncRule from "../../../../../models/syncRule";
import { Dictionary } from "../../../../../types/utils";
import { getValidationMessages } from "../../../../../utils/old-validations";
import {
    InstanceSelectionDropdown,
    InstanceSelectionOption,
} from "../../instance-selection-dropdown/InstanceSelectionDropdown";
import { SyncWizardStepProps } from "../Steps";

export const GeneralInfoStep = ({ syncRule, onChange }: SyncWizardStepProps) => {
    const classes = useStyles();

    const [errors, setErrors] = useState<Dictionary<string>>({});

    const onChangeField = useCallback(
        (field: keyof SyncRule) => {
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

            <div className={classes.row}>
                <InstanceSelectionDropdown
                    showInstances={{ local: true, remote: true }}
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
