import React, { useEffect, useState } from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { Button, LinearProgress, withStyles } from "@material-ui/core";
import { ConfirmationDialog, withSnackbar } from "d2-ui-components";

import { getInstances } from "./InstanceSelectionStep";
import { getBaseUrl } from "../../../../utils/d2";
import { getMetadata } from "../../../../utils/synchronization";
import { getValidationMessages } from "../../../../utils/validations";

const LiEntry = ({ label, value, children }) => {
    return (
        <li key={label}>
            {label}
            {value || children ? ": " : ""}
            {value}
            {children}
        </li>
    );
};

const styles = () => ({
    saveButton: {
        margin: 10,
        backgroundColor: "#2b98f0",
        color: "white",
    },
});

const SaveStep = ({ d2, syncRule, classes, onCancel, snackbar }) => {
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [metadata, updateMetadata] = useState({});
    const [instanceOptions, setInstanceOptions] = useState([]);

    const openCancelDialog = () => setCancelDialogOpen(true);

    const closeCancelDialog = () => setCancelDialogOpen(false);

    const save = async () => {
        setIsSaving(true);

        const errors = await getValidationMessages(d2, syncRule);
        if (errors.length > 0) {
            snackbar.error(errors.join("\n"));
        } else {
            await syncRule.save(d2);
            onCancel();
        }

        setIsSaving(false);
    };

    useEffect(() => {
        getMetadata(getBaseUrl(d2), syncRule.metadataIds, "id,name").then(updateMetadata);
        getInstances(d2).then(setInstanceOptions);
    }, [d2, syncRule]);

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={cancelDialogOpen}
                onSave={onCancel}
                onCancel={closeCancelDialog}
                title={i18n.t("Cancel synchronization rule wizard")}
                description={i18n.t(
                    "You are about to exit the Sync Rule Creation Wizard. All your changes will be lost. Are you sure you want to proceed?"
                )}
                saveText={i18n.t("Yes")}
            />

            <ul>
                <LiEntry label={i18n.t("Name")} value={syncRule.name} />

                <LiEntry label={i18n.t("Code")} value={syncRule.code} />

                <LiEntry label={i18n.t("Description")} value={syncRule.description} />

                {_.keys(metadata).map(metadataType => (
                    <LiEntry
                        key={metadataType}
                        label={`${d2.models[metadataType].displayName} [${metadata[metadataType].length}]`}
                    >
                        <ul>
                            {metadata[metadataType].map(({ id, name }) => (
                                <LiEntry key={id} label={`${name} (${id})`} />
                            ))}
                        </ul>
                    </LiEntry>
                ))}

                <LiEntry
                    label={i18n.t("Target instances [{{total}}]", {
                        total: syncRule.targetInstances.length,
                    })}
                >
                    <ul>
                        {syncRule.targetInstances.map(id => {
                            const instance = instanceOptions.find(e => e.value === id);
                            return instance ? (
                                <LiEntry key={instance.value} label={instance.text} />
                            ) : null;
                        })}
                    </ul>
                </LiEntry>

                <LiEntry label={i18n.t("Advanced options")}>
                    <ul>
                        <LiEntry
                            label={i18n.t("Include user information and sharing settings")}
                            value={
                                syncRule.syncParams.includeSharingSettings
                                    ? i18n.t("Yes")
                                    : i18n.t("No")
                            }
                        />
                    </ul>
                    <ul>
                        <LiEntry
                            label={i18n.t("Disable atomic verification")}
                            value={
                                syncRule.syncParams.atomicMode === "NONE"
                                    ? i18n.t("Yes")
                                    : i18n.t("No")
                            }
                        />
                    </ul>
                    <ul>
                        <LiEntry
                            label={i18n.t("Replace objects in destination instance")}
                            value={
                                syncRule.syncParams.mergeMode === "REPLACE"
                                    ? i18n.t("Yes")
                                    : i18n.t("No")
                            }
                        />
                    </ul>
                </LiEntry>

                <LiEntry
                    label={i18n.t("Scheduling")}
                    value={syncRule.enabled ? i18n.t("Enabled") : i18n.t("Disabled")}
                />

                {syncRule.longFrequency && (
                    <LiEntry label={i18n.t("Frequency")} value={syncRule.longFrequency} />
                )}
            </ul>

            <Button onClick={openCancelDialog} variant="contained">
                {i18n.t("Cancel")}
            </Button>
            <Button className={classes.saveButton} onClick={save} variant="contained">
                {i18n.t("Save")}
            </Button>

            {isSaving && <LinearProgress />}
        </React.Fragment>
    );
};

SaveStep.propTypes = {
    syncRule: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
    snackbar: PropTypes.object.isRequired,
};

SaveStep.defaultProps = {};

export default withSnackbar(withStyles(styles)(SaveStep));
