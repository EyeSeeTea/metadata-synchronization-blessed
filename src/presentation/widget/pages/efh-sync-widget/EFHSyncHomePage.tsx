import _ from "lodash";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { Box, LinearProgress, List, makeStyles, Paper, Typography } from "@material-ui/core";
import React from "react";
import { SynchronizationRule } from "../../../../domain/rules/entities/SynchronizationRule";
import i18n from "../../../../locales";
import { useAppContext } from "../../../react/core/contexts/AppContext";
import { CompositionRoot } from "../../../CompositionRoot";
import { formatDateLong } from "../../../../utils/date";
import { SyncRuleButtonProps, SyncRuleButton } from "./SyncRuleButton";
import { downloadFile } from "../../../utils/download";
import { SynchronizationReport } from "../../../../domain/reports/entities/SynchronizationReport";
import { SummaryTable } from "../../../react/core/components/sync-summary/SummaryTable";
import { SynchronizationResult, SynchronizationStats } from "../../../../domain/reports/entities/SynchronizationResult";
import moment from "moment";

export const EFHSyncHomePage: React.FC = React.memo(() => {
    const classes = useStyles();

    const logs = useLogs();
    const rules = useSyncRulesList();
    const [isRunning, runSyncRule] = useSyncRulesExecuter({ logs });

    return (
        <Paper className={classes.root}>
            <Box m={1} display="flex" justifyContent="space-between" alignItems="center">
                {rules.map(rule => (
                    <SyncRuleButton key={rule.id} rule={rule} onClick={runSyncRule} disabled={isRunning} />
                ))}
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
    );
});

const LinkDownloadOutput: React.FC<{ syncReport: SynchronizationReport }> = props => {
    const { syncReport } = props;

    const downloadJson = React.useCallback(
        (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            ev.preventDefault();
            downloadFile({
                filename: "efh-sync-response" + moment().toISOString() + ".json",
                buffer: JSON.stringify(syncReport),
            });
        },
        [syncReport]
    );

    return (
        <>
            {i18n.t("Output: ", { nsSeparator: false })}

            <a href="/download" onClick={downloadJson}>
                {i18n.t("JSON Response")}
            </a>
        </>
    );
};

const executeRule = async (compositionRoot: CompositionRoot, id: string, log: (msg: Message) => void) => {
    const synchronize = async () => {
        for await (const { message, syncReport, done } of sync.execute()) {
            if (message) log(message);
            if (syncReport) await compositionRoot.reports.save(syncReport);
            if (done && syncReport) {
                const stats = _(syncReport.getResults()).flatMap(getSynchronizationResultStats).value();

                const dateEnd = formatDateLong(new Date());
                log(i18n.t("Sync finished - {{dateEnd}}", { dateEnd }));
                log(
                    <div style={{ marginBottom: 20 }}>
                        <SummaryTable stats={stats} />
                    </div>
                );
                log(<LinkDownloadOutput syncReport={syncReport} />);
                log(i18n.t("Status: {{status}}", { status: syncReport.status, nsSeparator: false }));
            }
        }
    };

    const persistedRule = await compositionRoot.rules.get(id);
    if (!persistedRule) throw new Error(`Rule not found: ${id}`);

    /* Select org units and TEIs in persisted rule */
    const rule =
        persistedRule.type === "events" ? await compositionRoot.efh.updateSyncRule(persistedRule) : persistedRule;

    const { builder, id: syncRule, type } = rule;
    const dateStart = formatDateLong(new Date());
    log(i18n.t("Synchronizing rule {{name}} - {{dateStart}}", { name: rule.name, dateStart }));

    const prepareSyncResult = await compositionRoot.sync.prepare(type, builder);
    const sync = compositionRoot.sync[type]({ ...builder, syncRule });

    await prepareSyncResult.match({
        success: async () => synchronize(),
        error: async code => log(i18n.t("Error: {{code}}", { code, nsSeparator: false })),
    });
};

type Message = React.ReactNode;

interface Logs {
    messages: Message[];
    log(msg: Message): void;
    clear(): void;
}

function useLogs(): Logs {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const log = React.useCallback((msg: Message) => setMessages(msgs => [...msgs, msg]), []);
    const clear = React.useCallback(() => setMessages([]), []);
    return { messages, log, clear };
}

function useSyncRulesList() {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [rules, setRules] = React.useState<SynchronizationRule[]>([]);

    React.useEffect(() => {
        async function run() {
            try {
                const { rows: rules } = await compositionRoot.rules.list({
                    paging: false,
                    sorting: { field: "name", order: "asc" },
                    filters: { search: "EFH_" },
                });

                const efhRules = _(rules)
                    .keyBy(rule => rule.code || "")
                    .at(["EFH_METADATA", "EFH_DATA"])
                    .compact()
                    .value();

                setRules(efhRules);
            } catch (err: any) {
                snackbar.error(err.message);
            }
        }

        run();
    }, [compositionRoot, snackbar]);

    return rules;
}

function useSyncRulesExecuter(options: { logs: Logs }) {
    const { logs } = options;

    const [isRunning, setRunning] = React.useState(false);
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const execute = React.useCallback<SyncRuleButtonProps["onClick"]>(
        async rule => {
            setRunning(true);

            try {
                logs.clear();
                await executeRule(compositionRoot, rule.id, logs.log);
            } catch (err: any) {
                logs.log(`Error: ${err.message}`);
                snackbar.error(err.message);
            } finally {
                setRunning(false);
            }
        },
        [compositionRoot, snackbar, logs]
    );

    return [isRunning, execute] as const;
}

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
}));

function getSynchronizationResultStats(result: SynchronizationResult): SynchronizationStats[] {
    const typeStats = result.typeStats || [];
    const { payload } = result;
    const isEvents = payload && "events" in payload;
    const isTeis = payload && "trackedEntityInstances" in payload;

    const type = isEvents
        ? i18n.t("Consultations and Surgery (Events)")
        : isTeis
        ? i18n.t("Patients (Tracked Entity Instances)")
        : i18n.t("Total");

    const totalStats = result.stats ? [{ ...result.stats, type }] : [];

    return _.concat(typeStats, totalStats);
}
