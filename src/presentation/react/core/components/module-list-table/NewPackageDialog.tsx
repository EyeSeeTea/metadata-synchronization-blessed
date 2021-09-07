import { makeStyles, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import semver from "semver";
import { ValidationError } from "../../../../../domain/common/entities/Validations";
import { Module } from "../../../../../domain/modules/entities/Module";
import { Package } from "../../../../../domain/packages/entities/Package";
import i18n from "../../../../../locales";
import { Dictionary } from "../../../../../types/utils";
import { useAppContext } from "../../contexts/AppContext";

export const NewPackageDialog: React.FC<NewPackageDialogProps> = ({ module, save, close }) => {
    const { compositionRoot } = useAppContext();
    const classes = useStyles();

    const [versions, updateVersions] = useState<string[]>([]);
    const [item, updateItem] = useState<Package>(
        Package.build({
            name: i18n.t("Package of {{name}}", module),
            module,
            version: semver.parse(module.lastPackageVersion.split("-")[0])?.inc("patch").format() ?? "1.0.0",
        })
    );

    const [errors, setErrors] = useState<Dictionary<ValidationError>>({});

    const updateModel = useCallback(
        (field: keyof Package, value: string) => {
            const newPackage = item.update({ [field]: value });
            const errors = _.keyBy(newPackage.validate([field], module), "property");

            setErrors(errors);
            updateItem(newPackage);
        },
        [item, module]
    );

    const onChangeField = useCallback(
        (field: keyof Package) => {
            return (event: React.ChangeEvent<{ value: unknown }>) => {
                updateModel(field, event.target.value as string);
            };
        },
        [updateModel]
    );

    const updateVersionNumber = useCallback(
        (event: React.ChangeEvent<{ value: unknown }>) => {
            const revision = event.target.value as string;
            const tag = item.version.split("-")[1];
            const newVersion = semver.parse([revision, tag].join("-"))?.format();
            updateModel("version", newVersion ?? revision);
        },
        [item, updateModel]
    );

    const updateVersionTag = useCallback(
        (event: React.ChangeEvent<{ value: unknown }>) => {
            const revision = item.version.split("-")[0];
            const tag = event.target.value ? (event.target.value as string) : undefined;
            const newVersion = semver.parse([revision, tag].join("-"))?.format();
            updateModel("version", newVersion ?? revision);
        },
        [item, updateModel]
    );

    const onSave = useCallback(() => {
        const errors = item.validate(undefined, module);
        const messages = _.keyBy(errors, "property");

        if (errors.length === 0) save(item, versions);
        else setErrors(messages);
    }, [item, save, module, versions]);

    useEffect(() => {
        compositionRoot.instances.getVersion().then(version => {
            if (versions.length === 0) updateVersions([version]);
        });
    }, [compositionRoot, versions, updateVersions]);

    return (
        <ConfirmationDialog
            title={i18n.t("Generate package from {{name}}", module)}
            isOpen={true}
            maxWidth={"sm"}
            fullWidth={true}
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

            <div className={classes.versionRow}>
                <TextField
                    className={classes.marginRight}
                    fullWidth={true}
                    label={i18n.t("Version number (*)")}
                    value={item.version.split("-")[0] ?? ""}
                    onChange={updateVersionNumber}
                    error={!!errors["version"]}
                    helperText={errors["version"]?.description}
                />
                <TextField
                    fullWidth={true}
                    label={i18n.t("Version tag")}
                    value={item.version.split("-")[1] ?? ""}
                    onChange={updateVersionTag}
                />
            </div>

            <Autocomplete
                className={classes.row}
                multiple
                options={["2.30", "2.31", "2.32", "2.33", "2.34"]}
                value={versions}
                onChange={(_event, value) => updateVersions(value)}
                renderTags={(values: string[]) => values.sort().join(", ")}
                renderInput={params => <TextField {...params} variant="standard" label={i18n.t("DHIS2 Version (*)")} />}
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

export interface NewPackageDialogProps {
    module: Module;
    save: (item: Package, versions: string[]) => void;
    close: () => void;
}

const useStyles = makeStyles({
    row: {
        marginBottom: 25,
    },
    versionRow: {
        width: "100%",
        display: "flex",
        flex: "1 1 auto",
        marginBottom: 25,
    },
    marginRight: {
        marginRight: 10,
    },
});
