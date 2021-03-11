import { makeStyles, TextField } from "@material-ui/core";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { NamedRef } from "../../../../../../domain/common/entities/Ref";
import { ValidationError } from "../../../../../../domain/common/entities/Validations";
import { Module } from "../../../../../../domain/modules/entities/Module";
import i18n from "../../../../../../locales";
import { Dictionary } from "../../../../../../types/utils";
import { useAppContext } from "../../../contexts/AppContext";
import Dropdown from "../../dropdown/Dropdown";
import { ModuleWizardStepProps } from "../Steps";

export const GeneralInfoStep = ({ module, onChange, isEdit }: ModuleWizardStepProps) => {
    const { compositionRoot } = useAppContext();
    const classes = useStyles();

    const [errors, setErrors] = useState<Dictionary<ValidationError>>({});
    const [userGroups, setUserGroups] = useState<NamedRef[]>([]);

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

    const onChangeDepartment = useCallback(
        (id: string) => {
            const department = userGroups.find(group => group.id === id);
            onChange(module.update({ department }));
        },
        [module, onChange, userGroups]
    );

    useEffect(() => {
        compositionRoot.user.current().then(({ userGroups }) => setUserGroups(userGroups));
    }, [compositionRoot]);

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
                disabled={isEdit}
            />

            <Dropdown
                items={userGroups}
                label={i18n.t("Department (*)")}
                value={module.department?.id ?? ""}
                onValueChange={onChangeDepartment}
                view={"full-width"}
                disabled={isEdit}
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
