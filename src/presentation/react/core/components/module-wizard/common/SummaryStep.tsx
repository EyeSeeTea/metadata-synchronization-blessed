import { Button, LinearProgress, makeStyles } from "@material-ui/core";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { ReactNode, useEffect, useState } from "react";
import { NamedRef } from "../../../../../../domain/common/entities/Ref";
import { MetadataModule } from "../../../../../../domain/modules/entities/MetadataModule";
import { Module } from "../../../../../../domain/modules/entities/Module";
import i18n from "../../../../../../locales";
import { Dictionary } from "../../../../../../types/utils";
import { getMetadata } from "../../../../../../utils/synchronization";
import { useAppContext } from "../../../contexts/AppContext";
import { ModuleWizardStepProps } from "../Steps";
import { MetadataEntities } from "../../../../../../domain/metadata/entities/MetadataEntities";

export const SummaryStep = ({ module, onCancel, onClose }: ModuleWizardStepProps) => {
    const classes = useStyles();
    const snackbar = useSnackbar();
    const { api, compositionRoot } = useAppContext();

    const [isSaving, setIsSaving] = useState(false);
    const [metadata, updateMetadata] = useState<Dictionary<NamedRef[]>>({});

    const save = async () => {
        setIsSaving(true);

        const errors = await compositionRoot.modules.save(module);

        if (errors.length > 0) {
            snackbar.error(errors.join("\n"));
        } else {
            onClose();
        }

        setIsSaving(false);
    };

    useEffect(() => {
        getMetadata(api, module.metadataIds, "id,name").then(updateMetadata);
    }, [api, module]);

    return (
        <React.Fragment>
            <ul>
                {getEntries(module).map(LiEntry)}

                {module.type === "metadata" &&
                    _.keys(metadata).map(metadataType => {
                        const items = metadata[metadataType];

                        return (
                            items.length > 0 && (
                                <LiEntry
                                    key={metadataType}
                                    label={`${api.models[metadataType as keyof MetadataEntities].schema.displayName} [${
                                        items.length
                                    }]`}
                                >
                                    <ul>
                                        {items.map(({ id, name }) => (
                                            <LiEntry key={id} label={`${name} (${id})`} />
                                        ))}
                                    </ul>
                                </LiEntry>
                            )
                        );
                    })}
            </ul>
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
    label: string;
    value?: string | number;
    children?: ReactNode;
    hide?: boolean;
}

const LiEntry = ({ label, value, children, hide = false }: Entry) => {
    if (hide) return null;

    return (
        <li key={label}>
            {_.compact([label, value]).join(": ")}
            {children}
        </li>
    );
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
        { label: i18n.t("Name"), value: name },
        {
            label: i18n.t("Description"),
            value: description,
        },
    ];
};

const buildMetadataEntries = (module: MetadataModule): Entry[] => {
    return [
        ...buildCommonEntries(module),
        {
            label: i18n.t("Department"),
            value: module.department.name,
        },
        {
            label: i18n.t("Selected metadata"),
            value: `${module.metadataIds.length} elements`,
        },
        {
            label: i18n.t("Metadata exclusions"),
            value: `${module.excludedIds.length} elements`,
            hide: module.excludedIds.length === 0,
        },
    ];
};
