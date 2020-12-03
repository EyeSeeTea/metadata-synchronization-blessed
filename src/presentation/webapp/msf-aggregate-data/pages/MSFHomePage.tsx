import { Box, Button, List, makeStyles, Paper, Theme, Typography } from "@material-ui/core";
import i18n from "d2-ui-components/locales";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { DataSyncPeriod } from "../../../../domain/aggregated/types";
import { isGlobalAdmin } from "../../../../utils/permissions";
import PageHeader from "../../../react/core/components/page-header/PageHeader";
import { PeriodSelectionDialog } from "../../../react/core/components/period-selection-dialog/PeriodSelectionDialog";
import { useAppContext } from "../../../react/core/contexts/AppContext";

export interface PeriodFilter {
    period: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
}

export const MSFHomePage: React.FC = () => {
    const classes = useStyles();
    const history = useHistory();

    const [showPeriodDialog, setShowPeriodDialog] = useState(false);
    const [period, setPeriod] = useState<PeriodFilter>({ period: "ALL" });
    const [globalAdmin, setGlobalAdmin] = useState(false);
    const { api } = useAppContext();

    useEffect(() => {
        isGlobalAdmin(api).then(setGlobalAdmin);
    }, [api]);

    const handleAggregateData = () => {};
    const handleAdvancedSettings = () => {
        setShowPeriodDialog(true);
    };
    const handleMSFSettings = () => {};
    const handleGoToDashboard = () => {
        history.push("/dashboard");
    };
    const handleGoToHistory = () => {
        history.push("/history/events");
    };

    const handleCloseAdvancedSettings = () => {
        setShowPeriodDialog(false);
    };

    const handleSaveAdvancedSettings = (period: PeriodFilter) => {
        setShowPeriodDialog(false);
        setPeriod(period);
    };

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
                    >
                        {i18n.t("Aggregate Data")}
                    </Button>

                    <Box display="flex" flexGrow={2} justifyContent="center">
                        <Paper className={classes.log}>
                            <List>
                                <Typography variant="h6" gutterBottom>
                                    {i18n.t("Synchronization Progress")}
                                </Typography>
                                <Typography>{"Synchronizing Sync Rule 1 ..."}</Typography>
                                <Typography>{"Synchronizing Sync Rule 1 ..."}</Typography>
                                <Typography>{"Synchronizing Sync Rule 1 ..."}</Typography>
                                <Typography>{"Synchronizing Sync Rule 1 ..."}</Typography>
                                <Typography>{"Synchronizing Sync Rule 1 ..."}</Typography>
                                <Typography>{"Synchronizing Sync Rule 1 ..."}</Typography>
                                <Typography>{"Synchronizing Sync Rule 1 ..."}</Typography>
                            </List>
                        </Paper>
                    </Box>

                    <Box display="flex" flexDirection="row" justifyContent="space-between">
                        <Box display="flex" flexDirection="row">
                            <Button
                                className={classes.actionButton}
                                onClick={() => handleAdvancedSettings()}
                                variant="contained"
                            >
                                {i18n.t("Advanced Settings")}
                            </Button>
                            {globalAdmin && (
                                <Button
                                    className={classes.actionButton}
                                    onClick={() => handleMSFSettings()}
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
                                    onClick={() => handleGoToDashboard()}
                                    variant="contained"
                                >
                                    {i18n.t("Go To Admin Dashboard")}
                                </Button>
                            )}
                            <Button
                                className={classes.actionButton}
                                onClick={() => handleGoToHistory()}
                                variant="contained"
                            >
                                {i18n.t("Go to History")}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {showPeriodDialog && (
                <PeriodSelectionDialog
                    period={period}
                    onClose={handleCloseAdvancedSettings}
                    onSave={handleSaveAdvancedSettings}
                />
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
        width: "60%",
        margin: theme.spacing(4),
        padding: theme.spacing(4),
        overflow: "auto",
        minHeight: 300,
        maxHeight: 300,
    },
    actionButton: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
}));
