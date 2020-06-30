import i18n from "@dhis2/d2-i18n";
import {
    FormControl,
    InputLabel,
    makeStyles,
    MenuItem,
    Select,
    TextField,
} from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import SyncRule from "../../../../../models/syncRule";
import { Dictionary } from "../../../../../types/utils";
import { getValidationMessages } from "../../../../../utils/old-validations";
import { useAppContext } from "../../../../common/contexts/AppContext";
import { SyncWizardStepProps } from "../Steps";

export const GeneralInfoStep = ({ syncRule, onChange }: SyncWizardStepProps) => {
    const { api, compositionRoot } = useAppContext();
    const classes = useStyles();

    const [errors, setErrors] = useState<Dictionary<string>>({});
    const [instances, setInstances] = useState<Instance[]>([]);

    const onChangeField = useCallback(
        (field: keyof SyncRule) => {
            return async (event: React.ChangeEvent<{ value: unknown }>) => {
                const newRule = syncRule.update({ [field]: event.target.value });
                const messages = await getValidationMessages(api, newRule, [field]);

                setErrors(errors => ({ ...errors, [field]: messages.join("\n") }));
                onChange(newRule);
            };
        },
        [syncRule, onChange, api]
    );

    const onChangeInstance = useCallback(
        (event: React.ChangeEvent<{ value: unknown }>) => {
            const newRule = syncRule
                .update({ originInstance: event.target.value as string })
                .updateTargetInstances([])
                .updateMetadataIds([])
                .updateExcludedIds([]);

            onChange(newRule);
        },
        [syncRule, onChange]
    );

    useEffect(() => {
        compositionRoot
            .instances()
            .list()
            .then(setInstances);
    }, [compositionRoot]);

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

            {instances.length > 0 && (
                <FormControl fullWidth={true}>
                    <InputLabel>{i18n.t("Source instance")}</InputLabel>
                    <Select value={syncRule.originInstance} onChange={onChangeInstance}>
                        {[{ id: "LOCAL", name: i18n.t("This instance") }, ...instances].map(
                            ({ id, name }) => (
                                <MenuItem key={id} value={id}>
                                    {name}
                                </MenuItem>
                            )
                        )}
                    </Select>
                </FormControl>
            )}

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
