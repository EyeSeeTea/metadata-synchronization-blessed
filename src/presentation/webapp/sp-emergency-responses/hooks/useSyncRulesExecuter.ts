import { useSnackbar } from "@eyeseetea/d2-ui-components";
import React from "react";
import { EmergencyType } from "../../../../domain/entities/EmergencyResponses";
import { SynchronizationReport } from "../../../../domain/reports/entities/SynchronizationReport";
import { SynchronizationRule } from "../../../../domain/rules/entities/SynchronizationRule";
import { useAppContext } from "../../../react/core/contexts/AppContext";
import { executeRule } from "../utils/executeRule";
import { Logs } from "./useLogs";

export function useSyncRulesExecuter(options: { logs: Logs; emergencyType: EmergencyType }) {
    const { emergencyType, logs } = options;

    const [running, setRunning] = React.useState<Record<string, boolean>>();
    const [syncRuleResults, setSyncRuleResults] = React.useState<SynchronizationReport[]>([]);
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const execute = React.useCallback(
        async (rule: SynchronizationRule, currentRule: number, totalRules: number) => {
            if (currentRule === 1) {
                setSyncRuleResults([]);
            }

            setRunning(running => (running ? { ...running, [rule.id]: true } : { [rule.id]: true }));

            try {
                await executeRule({
                    compositionRoot,
                    emergencyType,
                    id: rule.id,
                    log: logs.log,
                    currentRule,
                    totalRules,
                    syncRuleDone: (syncReport: SynchronizationReport) => {
                        setSyncRuleResults(results => [...results, syncReport]);
                    },
                });
            } catch (err: any) {
                logs.log(`Error: ${err.message}`);
                snackbar.error(err.message);
            } finally {
                setRunning(running => (running ? { ...running, [rule.id]: false } : { [rule.id]: false }));
            }
        },
        [compositionRoot, snackbar, logs, emergencyType]
    );

    const isRunning = React.useMemo(() => Boolean(running && Object.values(running).some(Boolean)), [running]);

    return [isRunning, execute, syncRuleResults] as const;
}
