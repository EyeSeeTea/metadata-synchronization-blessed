import { indexOf } from "lodash";
import React, { useEffect } from "react";
import { Box, Button, LinearProgress, List, makeStyles, Paper, Typography } from "@material-ui/core";
import { SynchronizationRule } from "../../../domain/rules/entities/SynchronizationRule";

import { EmergencyType } from "../../../domain/entities/EmergencyResponses";
import i18n from "../../../utils/i18n";
import { promiseMap } from "../../../utils/common";
import { styled } from "styled-components";
import { useLogs } from "./hooks/useLogs";
import { useSyncRulesList } from "./hooks/useSyncRulesList";
import { useSyncRulesExecuter } from "./hooks/useSyncRulesExecuter";
import { FinishData, FinishDialog } from "./components/FinishDialog";

interface EmergencyResponsesSyncHomePageProps {
    emergencyType: EmergencyType;
}

export const EmergencyResponsesSyncHomePage: React.FC<EmergencyResponsesSyncHomePageProps> = React.memo(props => {
    const { emergencyType } = props;
    const classes = useStyles();

    const logs = useLogs();
    const rules = useSyncRulesList(emergencyType);
    const [isRunning, runSyncRule, syncRuleResults] = useSyncRulesExecuter({ emergencyType, logs });
    const [finishData, setFinishData] = React.useState<FinishData>();

    const executeRules = React.useCallback(
        (rules: SynchronizationRule[]) =>
            promiseMap(rules, rule => {
                const currentRule = indexOf(rules, rule) + 1;
                const totalRules = rules.length;

                console.debug("Running: " + rule.name);

                return runSyncRule(rule, currentRule, totalRules);
            }),
        [runSyncRule]
    );

    const executeMetadataRules = React.useCallback(
        () => executeRules(rules.filter(rule => rule.type === "metadata")),
        [rules, executeRules]
    );

    const executeEventsRules = React.useCallback(
        () => executeRules(rules.filter(rule => rule.type === "events")),
        [rules, executeRules]
    );

    useEffect(() => {
        if (!isRunning && syncRuleResults.length > 0) {
            const isFailed = syncRuleResults.some(result => result.status === "FAILURE");
            const lastSyncRuleResult = syncRuleResults[syncRuleResults.length - 1];
            const type = lastSyncRuleResult.type === "metadata" ? "getConfiguration" : "pushData";

            setFinishData({
                type,
                isFailed,
            });
        } else {
            setFinishData(undefined);
        }
    }, [isRunning, syncRuleResults]);

    const hideConfirmationDialog = React.useCallback(() => setFinishData(undefined), []);

    return (
        <>
            <Paper className={classes.root}>
                <Box m={1} display="flex" justifyContent="space-between" alignItems="center">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={executeMetadataRules}
                        disabled={isRunning}
                        className={classes.runButton}
                    >
                        {i18n.t("Get configuration from HQ server")}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={executeEventsRules}
                        disabled={isRunning}
                        className={classes.runButton}
                    >
                        {i18n.t("Push data to HQ server")}
                    </Button>
                </Box>

                <Paper className={classes.log}>
                    {isRunning && <LinearProgress />}

                    <List className={classes.list}>
                        {logs.messages.map((msg, idx) => (
                            <Typography key={idx}>{msg}</Typography>
                        ))}
                    </List>
                </Paper>
            </Paper>
            {finishData && <FinishDialog data={finishData} onCancel={hideConfirmationDialog} />}
        </>
    );
});

export const useStyles = makeStyles(theme => ({
    root: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
    },
    log: {
        width: "100%",
        overflow: "auto",
        height: "100%",
    },
    list: {
        minHeight: 275,
        overflow: "auto",
        padding: 10,
    },
    runButton: {
        margin: "0 auto",
    },
}));

type ColorStatus = "success" | "error" | "info";

export const Status = styled.span<{ color: ColorStatus }>`
    color: ${props => (props.color === "error" ? "#d60f0f" : props.color === "success" ? "#0e9825" : "#000000")};
    font-weight: bold;
`;
