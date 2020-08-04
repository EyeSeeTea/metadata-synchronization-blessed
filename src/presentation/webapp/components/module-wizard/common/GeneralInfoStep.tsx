import { makeStyles, TextField } from "@material-ui/core";
import _ from "lodash";
import React, { useCallback, useState } from "react";
import { ValidationError } from "../../../../../domain/common/entities/Validations";
import { Module } from "../../../../../domain/modules/entities/Module";
import i18n from "../../../../../locales";
import { Dictionary } from "../../../../../types/utils";
import { ModuleWizardStepProps } from "../Steps";

export const GeneralInfoStep = ({ module, onChange }: ModuleWizardStepProps) => {
    const classes = useStyles();
    const [errors, setErrors] = useState<Dictionary<ValidationError>>({});

    const onChangeField = useCallback(
        (field: keyof Module) => {
            return (event: React.ChangeEvent<HTMLInputElement>) => {
                const newModule = module.update({ [field]: event.target.value });
                const errors = _.keyBy(newModule.validate([field]), "property");

                setErrors(errors);
                onChange(newModule);
            };
        },
        [module, onChange]
    );

    return (
        <React.Fragment>
            <TextField
                className={classes.row}
                fullWidth={true}
                label={i18n.t("Name (*)")}
                value={module.name ?? ""}
                onChange={onChangeField("name")}
                error={!!errors["name"]}
                helperText={errors["name"]?.description}
            />

            <TextField
                className={classes.row}
                fullWidth={true}
                label={i18n.t("Department")}
                value={module.department ?? ""}
                onChange={onChangeField("department")}
                error={!!errors["department"]}
                helperText={errors["department"]?.description}
            />

            <TextField
                className={classes.row}
                fullWidth={true}
                multiline={true}
                rows={4}
                label={i18n.t("Description")}
                value={module.description ?? ""}
                onChange={onChangeField("description")}
                error={!!errors["description"]}
                helperText={errors["description"]?.description}
            />
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    row: {
        marginBottom: 25,
    },
});
