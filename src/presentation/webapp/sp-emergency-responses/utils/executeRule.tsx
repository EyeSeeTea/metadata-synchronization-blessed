import { Divider, Typography } from "@material-ui/core";
import _ from "lodash";
import { EmergencyType } from "../../../../domain/entities/EmergencyResponses";
import { SynchronizationReport } from "../../../../domain/reports/entities/SynchronizationReport";
import { SynchronizationResult, SynchronizationStats } from "../../../../domain/reports/entities/SynchronizationResult";
import { formatDateLong } from "../../../../utils/date";
import i18n from "../../../../utils/i18n";
import { CompositionRoot } from "../../../CompositionRoot";
import { SummaryTable } from "../../../react/core/components/sync-summary/SummaryTable";
import { LinkDownloadOutput } from "../components/LinkDownloadOutput";
import { Status } from "../EmergencyResponsesSyncHomePage";
import { Message } from "../hooks/useLogs";

type ExecuteRuleProps = {
    compositionRoot: CompositionRoot;
    emergencyType: EmergencyType;
    id: string;
    currentRule: number;
    totalRules: number;
    log: (msg: Message) => void;
    syncRuleDone: (syncReport: SynchronizationReport) => void;
};

export const executeRule = async (props: ExecuteRuleProps) => {
    const { compositionRoot, emergencyType, id, currentRule, totalRules, log, syncRuleDone } = props;

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
                log(
                    <Typography>
                        {i18n.t("Status: ", { nsSeparator: false })}
                        <Status color={syncReport.status === "FAILURE" ? "error" : "success"}>
                            {syncReport.status}
                        </Status>
                    </Typography>
                );

                log(<Divider style={{ marginTop: 10, marginBottom: 10 }} />);

                syncRuleDone(syncReport);
            }
        }
    };

    const persistedRule = await compositionRoot.rules.get(id);
    if (!persistedRule) throw new Error(`Rule not found: ${id}`);

    /* Select org units and TEIs in persisted rule */
    const rule =
        persistedRule.type === "events"
            ? await compositionRoot.emergencyResponses.updateSyncRule(persistedRule, emergencyType)
            : persistedRule;

    const { builder, id: syncRule, type } = rule;
    const dateStart = formatDateLong(new Date());
    log(
        i18n.t("Synchronizing rule {{currentRule}} out of {{totalRules}} {{name}} - {{dateStart}}", {
            name: rule.name,
            dateStart,
            currentRule,
            totalRules,
        })
    );

    const prepareSyncResult = await compositionRoot.sync.prepare(type, builder);
    const sync = compositionRoot.sync[type]({ ...builder, syncRule });

    await prepareSyncResult.match({
        success: async () => synchronize(),
        error: async code => log(i18n.t("Error: {{code}}", { code, nsSeparator: false })),
    });
};

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
