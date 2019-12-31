import i18n from "@dhis2/d2-i18n";
import { Button, LinearProgress, withStyles } from "@material-ui/core";
import { useD2, useD2Api } from "d2-api";
import { ConfirmationDialog, useSnackbar, withLoading } from "d2-ui-components";
import FileSaver from "file-saver";
import _ from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { AggregatedSync } from "../../../logic/sync/aggregated";
import { EventsSync } from "../../../logic/sync/events";
import { MetadataSync } from "../../../logic/sync/metadata";
import { getBaseUrl } from "../../../utils/d2";
import { getMetadata } from "../../../utils/synchronization";
import { getValidationMessages } from "../../../utils/validations";
import { getInstances } from "./InstanceSelectionStep";
import { availablePeriods } from "../data/PeriodSelectionStep";

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
    buttonContainer: {
        display: "flex",
        justifyContent: "space-between",
    },
});

const config = {
    metadata: {
        SyncClass: MetadataSync,
    },
    aggregated: {
        SyncClass: AggregatedSync,
    },
    events: {
        SyncClass: EventsSync,
    },
};

const SaveStep = ({ syncRule, classes, onCancel, loading }) => {
    const d2 = useD2();
    const api = useD2Api();
    const snackbar = useSnackbar();

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [metadata, updateMetadata] = useState({});
    const [instanceOptions, setInstanceOptions] = useState([]);

    const openCancelDialog = () => setCancelDialogOpen(true);

    const closeCancelDialog = () => setCancelDialogOpen(false);

    const name = syncRule.isOnDemand()
        ? `Rule generated on ${moment().format("YYYY-MM-DD HH:mm:ss")}`
        : syncRule.name;

    const save = async () => {
        setIsSaving(true);

        const errors = await getValidationMessages(d2, syncRule);
        if (errors.length > 0) {
            snackbar.error(errors.join("\n"));
        } else {
            await syncRule.updateName(name).save(d2);
            onCancel();
        }

        setIsSaving(false);
    };

    const downloadJSON = async () => {
        const { SyncClass } = config[syncRule.type];

        loading.show(true, "Generating JSON file");

        const sync = new SyncClass(d2, api, syncRule.toBuilder());
        const payload = await sync.buildPayload();

        const json = JSON.stringify(payload, null, 4);
        const blob = new Blob([json], { type: "application/json" });
        FileSaver.saveAs(blob, `${syncRule.type}-sync-${moment().format("YYYYMMDDHHmm")}.json`);
        loading.reset();
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
                <LiEntry label={i18n.t("Name")} value={name} />

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

                {syncRule.type !== "metadata" && (
                    <LiEntry
                        label={i18n.t("Period")}
                        value={_.find(availablePeriods, { id: syncRule.dataSyncPeriod })?.name}
                    >
                        {syncRule.dataSyncPeriod === "FIXED" && (
                            <ul>
                                <LiEntry
                                    label={i18n.t("Start date")}
                                    value={syncRule.dataSyncStartDate.format("YYYY-MM-DD")}
                                />
                            </ul>
                        )}
                        {syncRule.dataSyncPeriod === "FIXED" && (
                            <ul>
                                <LiEntry
                                    label={i18n.t("End date")}
                                    value={syncRule.dataSyncEndDate.format("YYYY-MM-DD")}
                                />
                            </ul>
                        )}
                    </LiEntry>
                )}

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

                {syncRule.type === "metadata" && (
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
                )}

                <LiEntry
                    label={i18n.t("Scheduling")}
                    value={syncRule.enabled ? i18n.t("Enabled") : i18n.t("Disabled")}
                />

                {syncRule.longFrequency && (
                    <LiEntry label={i18n.t("Frequency")} value={syncRule.longFrequency} />
                )}
            </ul>

            <div className={classes.buttonContainer}>
                <div>
                    {!syncRule.isOnDemand() && (
                        <Button onClick={openCancelDialog} variant="contained">
                            {i18n.t("Cancel")}
                        </Button>
                    )}
                    <Button className={classes.saveButton} onClick={save} variant="contained">
                        {syncRule.isOnDemand() ? i18n.t("Save as sync Rule") : i18n.t("Save")}
                    </Button>
                </div>
                <div>
                    <Button onClick={downloadJSON} variant="contained">
                        {i18n.t("Download JSON")}
                    </Button>
                </div>
            </div>

            {isSaving && <LinearProgress />}
        </React.Fragment>
    );
};

SaveStep.propTypes = {
    syncRule: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
    loading: PropTypes.object.isRequired,
};

SaveStep.defaultProps = {};

export default withLoading(withStyles(styles)(SaveStep));
