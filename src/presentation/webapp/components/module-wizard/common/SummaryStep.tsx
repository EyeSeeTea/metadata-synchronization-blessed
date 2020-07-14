import { Button, LinearProgress, makeStyles } from "@material-ui/core";
import { useSnackbar } from "d2-ui-components";
import React, { ReactNode, useState } from "react";
import { Module } from "../../../../../domain/modules/entities/Module";
import { MetadataModule } from "../../../../../domain/modules/entities/MetadataModule";
import i18n from "../../../../../locales";
import { useAppContext } from "../../../../common/contexts/AppContext";
import { ModuleWizardStepProps } from "../Steps";

export const SummaryStep = ({ module, onCancel, onClose }: ModuleWizardStepProps) => {
    const classes = useStyles();
    const snackbar = useSnackbar();
    const { compositionRoot } = useAppContext();

    const [isSaving, setIsSaving] = useState(false);

    const save = async () => {
        setIsSaving(true);

        const errors = await compositionRoot.modules().save(module);

        if (errors.length > 0) {
            snackbar.error(errors.join("\n"));
        } else {
            onClose();
        }

        setIsSaving(false);
    };

    return (
        <React.Fragment>
            <ul>{getEntries(module).map(LiEntry)}</ul>

            <div className={classes.buttonContainer}>
                <div>
                    <Button onClick={onCancel} variant="contained">
                        {i18n.t("Cancel")}
                    </Button>
                    <Button className={classes.saveButton} onClick={save} variant="contained">
                        {i18n.t("Save")}
                    </Button>
                </div>
            </div>

            {isSaving && <LinearProgress />}
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    saveButton: {
        margin: 10,
        backgroundColor: "#2b98f0",
        color: "white",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "space-between",
    },
});

interface Entry {
    key: string;
    label?: string;
    value?: string | number;
    children?: ReactNode;
    hide?: boolean;
}

const LiEntry = ({ key, label, value, children, hide = false }: Entry) => {
    const hasValue = value || children;

    return hasValue && !hide ? (
        <li key={key}>
            {[label, value].join(": ")}
            {children}
        </li>
    ) : null;
};

const getEntries = (module: Module): Entry[] => {
    switch (module.type) {
        case "metadata":
            return buildMetadataEntries(module as MetadataModule);
        default:
            return buildCommonEntries(module);
    }
};

const buildCommonEntries = ({ name, description }: Module): Entry[] => {
    return [
        { key: "name", label: i18n.t("Name"), value: name },
        {
            key: "description",
            label: i18n.t("Description"),
            value: description,
        },
    ];
};

const buildMetadataEntries = (module: MetadataModule): Entry[] => {
    return [
        ...buildCommonEntries(module),
        {
            key: "metadata",
            label: i18n.t("Selected metadata"),
            value: `${module.metadataIds.length} elements`,
        },
        {
            key: "exclusions",
            label: i18n.t("Metadata exclusions"),
            value: `${module.excludedIds.length} elements`,
            hide: module.excludedIds.length === 0,
        },
    ];
};
