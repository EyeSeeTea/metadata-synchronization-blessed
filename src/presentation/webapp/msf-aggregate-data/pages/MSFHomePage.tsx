import { Box, Button, List, makeStyles, Paper, Theme, Typography } from "@material-ui/core";
import { ConfirmationDialog } from "d2-ui-components";
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { SynchronizationReport } from "../../../../domain/reports/entities/SynchronizationReport";
import i18n from "../../../../locales";
import { isGlobalAdmin } from "../../../../utils/permissions";
import PageHeader from "../../../react/core/components/page-header/PageHeader";
import { useAppContext } from "../../../react/core/contexts/AppContext";
import { AdvancedSettingsDialog } from "../../../react/msf-aggregate-data/components/advanced-settings-dialog/AdvancedSettingsDialog";
import { MSFSettingsDialog } from "../../../react/msf-aggregate-data/components/msf-settings-dialog/MSFSettingsDialog";
import {
    AdvancedSettings,
    defaultMSFSettings,
    MSFSettings,
    MSFStorageKey,
    PersistedMSFSettings,
} from "./MSFEntities";
import { executeAggregateData, isGlobalInstance } from "./MSFHomePagePresenter";

export const MSFHomePage: React.FC = () => {
    const { api, compositionRoot } = useAppContext();
    const classes = useStyles();
    const history = useHistory();

    const messageList = useRef<HTMLUListElement>(null);

    const [running, setRunning] = useState<boolean>(false);
    const [syncProgress, setSyncProgress] = useState<string[]>([]);
    const [showPeriodDialog, setShowPeriodDialog] = useState(false);
    const [showMSFSettingsDialog, setShowMSFSettingsDialog] = useState(false);
    const [msfValidationErrors, setMsfValidationErrors] = useState<string[]>();
    const [syncReports, setSyncReports] = useState<SynchronizationReport[]>([]);
    const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
        period: undefined,
    });

    const [globalAdmin, setGlobalAdmin] = useState(false);
    const [msfSettings, setMsfSettings] = useState<MSFSettings>(defaultMSFSettings);

    useEffect(() => {
        isGlobalAdmin(api).then(setGlobalAdmin);
    }, [api]);

    useEffect(() => {
        compositionRoot.customData.get<PersistedMSFSettings>(MSFStorageKey).then(settings => {
            setMsfSettings(oldSettings => ({
                ...oldSettings,
                ...settings,
                runAnalytics: isGlobalInstance() ? "false" : "by-sync-rule-settings",
            }));
        });
    }, [compositionRoot]);

    const handleAggregateData = async (skipCheckInPreviousPeriods?: boolean) => {
        setRunning(true);
        setSyncReports([]);

        const reports = await executeAggregateData(
            compositionRoot,
            advancedSettings,
            skipCheckInPreviousPeriods
                ? { ...msfSettings, checkInPreviousPeriods: false }
                : msfSettings,
            progress => setSyncProgress(progress),
            errors => setMsfValidationErrors(errors)
        );

        setSyncReports(reports);
        setRunning(false);
    };

    const handleOpenAdvancedSettings = () => {
        setShowPeriodDialog(true);
    };

    const handleMSFSettings = () => {
        setShowMSFSettingsDialog(true);
    };

    const handleGoToDashboard = () => {
        history.push("/dashboard");
    };
    const handleGoToHistory = () => {
        history.push("/msf/history");
    };

    const handleCloseAdvancedSettings = () => {
        setShowPeriodDialog(false);
    };

    const handleSaveAdvancedSettings = (advancedSettings: AdvancedSettings) => {
        setShowPeriodDialog(false);
        setAdvancedSettings(advancedSettings);
    };

    const handleCloseMSFSettings = () => {
        setShowMSFSettingsDialog(false);
    };

    const handleSaveMSFSettings = (msfSettings: MSFSettings) => {
        setShowMSFSettingsDialog(false);
        setMsfSettings(msfSettings);
        compositionRoot.customData.save(MSFStorageKey, { ...msfSettings, runAnalytics: undefined });
    };

    const handleDownloadPayload = async () => {
        await compositionRoot.reports.downloadPayloads(syncReports);
    };

    useEffect(() => {
        if (messageList.current === null) return;

        // Follow contents of logs
        messageList.current.scrollTop = messageList.current.scrollHeight;
    }, [syncProgress, messageList]);

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Aggregate Data For HMIS")} />

            <Paper className={classes.root}>
                <Box display="flex" flexDirection="column">
                    <Button
                        onClick={() => handleAggregateData()}
                        variant="contained"
                        color="primary"
                        className={classes.runButton}
                        disabled={running}
                    >
                        {i18n.t("Aggregate Data")}
                    </Button>

                    <Box display="flex" flexGrow={2} justifyContent="center">
                        <Paper className={classes.log}>
                            <Typography variant="h6" gutterBottom>
                                {i18n.t("Synchronization Progress")}
                            </Typography>

                            <List ref={messageList} className={classes.list}>
                                {syncProgress.map((trace, index) => (
                                    <Typography key={index}>{trace}</Typography>
                                ))}
                            </List>

                            {syncReports.length > 0 && (
                                <Button
                                    className={classes.downloadButton}
                                    onClick={handleDownloadPayload}
                                    variant="contained"
                                >
                                    {i18n.t("Download payload")}
                                </Button>
                            )}
                        </Paper>
                    </Box>

                    <Box display="flex" flexDirection="row" justifyContent="space-between">
                        <Box display="flex" flexDirection="row">
                            <Button
                                className={classes.actionButton}
                                onClick={handleOpenAdvancedSettings}
                                variant="contained"
                            >
                                {i18n.t("Advanced Settings")}
                            </Button>
                            {globalAdmin && (
                                <Button
                                    className={classes.actionButton}
                                    onClick={handleMSFSettings}
                                    variant="contained"
                                >
                                    {i18n.t("MSF Settings")}
                                </Button>
                            )}
                        </Box>
                        <Box display="flex" flexDirection="row">
                            {globalAdmin && (
                                <Button
                                    className={classes.actionButton}
                                    onClick={handleGoToDashboard}
                                    variant="contained"
                                >
                                    {i18n.t("Go To Admin Dashboard")}
                                </Button>
                            )}
                            <Button
                                className={classes.actionButton}
                                onClick={handleGoToHistory}
                                variant="contained"
                            >
                                {i18n.t("Go to History")}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {showPeriodDialog && (
                <AdvancedSettingsDialog
                    title={i18n.t("Advanced Settings")}
                    advancedSettings={advancedSettings}
                    onClose={handleCloseAdvancedSettings}
                    onSave={handleSaveAdvancedSettings}
                />
            )}

            {showMSFSettingsDialog && (
                <MSFSettingsDialog
                    settings={msfSettings}
                    onClose={handleCloseMSFSettings}
                    onSave={handleSaveMSFSettings}
                />
            )}

            {msfValidationErrors && msfValidationErrors.length > 0 && (
                <ConfirmationDialog
                    open={true}
                    maxWidth="md"
                    fullWidth={true}
                    title={i18n.t("MSF Validation")}
                    onCancel={() => setMsfValidationErrors(undefined)}
                    onSave={() => {
                        setMsfValidationErrors(undefined);
                        handleAggregateData(true);
                    }}
                    cancelText={i18n.t("Cancel")}
                    saveText={i18n.t("Proceed")}
                >
                    <Typography>{i18n.t("There are issues with data values:")}</Typography>
                    <ul>
                        {msfValidationErrors.map((error, index) => {
                            return (
                                <li key={`err-${index}`}>
                                    <Typography>{error}</Typography>
                                </li>
                            );
                        })}
                    </ul>
                    <Typography>{i18n.t("Do you want to proceed?")}</Typography>
                </ConfirmationDialog>
            )}
        </React.Fragment>
    );
};

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
    },
    runButton: {
        margin: "0 auto",
    },
    log: {
        width: "100%",
        margin: theme.spacing(2),
        padding: theme.spacing(4),
        overflow: "auto",
        minHeight: 400,
        maxHeight: 400,
    },
    actionButton: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    downloadButton: {
        margin: theme.spacing(2),
        float: "right",
    },
    list: {
        height: 275,
        overflow: "auto",
    },
}));
