import { makeStyles, TextField } from "@material-ui/core";
import { ConfirmationDialog } from "d2-ui-components";
import _, { Dictionary } from "lodash";
import React, { useCallback, useState } from "react";
import { ValidationError } from "../../../../domain/common/entities/Validations";
import { Module } from "../../../../domain/modules/entities/Module";
import { Package } from "../../../../domain/modules/entities/Package";
import i18n from "../../../../locales";

export const NewPacakgeDialog: React.FC<NewPacakgeDialogProps> = ({ module, save, close }) => {
    const classes = useStyles();

    const [item, updateItem] = useState<Package>(
        Package.build({ module: { id: module.id, name: module.name, instance: module.instance } })
    );

    const [errors, setErrors] = useState<Dictionary<ValidationError>>({});

    const onChangeField = useCallback(
        (field: keyof Package) => {
            return (event: React.ChangeEvent<HTMLInputElement>) => {
                const newPackage = item.update({ [field]: event.target.value });
                const errors = _.keyBy(newPackage.validate([field]), "property");

                setErrors(errors);
                updateItem(newPackage);
            };
        },
        [item, updateItem]
    );

    const onSave = useCallback(() => {
        const errors = item.validate();
        const messages = _.keyBy(errors, "property");

        if (errors.length === 0) save(item);
        else setErrors(messages);
    }, [item, save])

    return (
        <ConfirmationDialog
            title={i18n.t("Generate package from {{name}}", module)}
            isOpen={true}
            maxWidth={"xl"}
            onCancel={close}
            onSave={onSave}
        >
            <TextField
                className={classes.row}
                fullWidth={true}
                label={i18n.t("Name (*)")}
                value={item.name ?? ""}
                onChange={onChangeField("name")}
                error={!!errors["name"]}
                helperText={errors["name"]?.description}
            />

            <TextField
                className={classes.row}
                fullWidth={true}
                label={i18n.t("Version (*)")}
                value={item.version ?? ""}
                onChange={onChangeField("version")}
                error={!!errors["version"]}
                helperText={errors["version"]?.description}
            />

            <TextField
                className={classes.row}
                fullWidth={true}
                multiline={true}
                rows={4}
                label={i18n.t("Description")}
                value={item.description ?? ""}
                onChange={onChangeField("description")}
                error={!!errors["description"]}
                helperText={errors["description"]?.description}
            />
        </ConfirmationDialog>
    );
};

export interface NewPacakgeDialogProps {
    module: Module;
    save: (item: Package) => void;
    close: () => void;
}

const useStyles = makeStyles({
    row: {
        marginBottom: 25,
    },
});
