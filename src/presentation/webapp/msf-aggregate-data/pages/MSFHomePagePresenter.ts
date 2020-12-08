import _ from "lodash";
import { Period } from "../../../../domain/common/entities/Period";
import { SynchronizationRule } from "../../../../domain/rules/entities/SynchronizationRule";
import i18n from "../../../../locales";
import { executeAnalytics } from "../../../../utils/analytics";
import { promiseMap } from "../../../../utils/common";
import { formatDateLong } from "../../../../utils/date";
import { CompositionRoot } from "../../../CompositionRoot";
import { MSFSettings } from "../../../react/msf-aggregate-data/components/msf-Settings/MSFSettingsDialog";

//TODO: maybe convert to class and presenter to use MVP, MVI pattern
export async function executeAggregateData(
    compositionRoot: CompositionRoot,
    msfSettings: MSFSettings,
    onProgressChange: (progress: string[]) => void,
    period?: Period
) {
    let syncProgress: string[] = [i18n.t(`Starting Aggregate Data...`)];

    onProgressChange(syncProgress);

    const onSyncRuleProgressChange = (event: string) => {
        const lastEvent = syncProgress[syncProgress.length - 1];

        if (lastEvent !== event) {
            syncProgress = [...syncProgress, event];
            onProgressChange(syncProgress);
        }
    };

    if (isGlobalInstance && msfSettings.runAnalytics === false) {
        const lastExecution = await getLastAnalyticsExecution(compositionRoot);

        onSyncRuleProgressChange(i18n.t("Run analytics is disabled, last analytics execution: {{lastExecution}}", { lastExecution }));
    }

    const eventSyncRules = await getSyncRules(compositionRoot);

    const runAnalyticsIsRequired =
        msfSettings.runAnalytics === "by-sync-rule-settings"
            ? eventSyncRules.some(rule => rule.builder.dataParams?.runAnalytics ?? false)
            : msfSettings.runAnalytics;

    const rulesWithoutRunAnalylics = eventSyncRules.map(rule =>
        rule.updateBuilderDataParams({ ...rule.builder.dataParams, runAnalytics: false })
    );

    if (runAnalyticsIsRequired) {
        await runAnalytics(compositionRoot, onSyncRuleProgressChange);
    }

    for (const syncRule of rulesWithoutRunAnalylics) {
        await executeSyncRule(compositionRoot, syncRule, onSyncRuleProgressChange, period);
    }

    onProgressChange([...syncProgress, i18n.t(`Finished Aggregate Data`)]);
}

export function isGlobalInstance(): boolean {
    return !window.location.host.includes("localhost")
}

async function executeSyncRule(
    compositionRoot: CompositionRoot,
    rule: SynchronizationRule,
    onProgressChange: (event: string) => void,
    period?: Period
): Promise<void> {
    const { name, builder, id: syncRule, type = "metadata" } = rule;

    const newBuilder = period
        ? {
            ...builder,
            dataParams: {
                ...builder.dataParams,
                period: period.type,
                startDate: period.startDate,
                endDate: period.endDate,
            },
        }
        : builder;

    onProgressChange(i18n.t(`Starting Sync Rule {{name}} ...`, { name }));

    const sync = compositionRoot.sync[type]({ ...newBuilder, syncRule });

    for await (const { message, syncReport, done } of sync.execute()) {
        if (message) onProgressChange(message);
        if (syncReport) await compositionRoot.reports.save(syncReport);

        if (done && syncReport) {
            onProgressChange(i18n.t(`Finished Sync Rule {{name}}`, { name }));
        } else if (done) {
            onProgressChange(i18n.t(`Finished Sync Rule {{name}} with errors`, { name }));
        }
    }
}

async function getSyncRules(compositionRoot: CompositionRoot): Promise<SynchronizationRule[]> {
    const rulesList = (
        await compositionRoot.rules.list({ filters: { type: "events" }, paging: false })
    ).rows.slice(0, 2);

    const rules = await promiseMap(rulesList, rule => {
        return compositionRoot.rules.get(rule.id);
    });

    return _.compact(rules);
}

async function runAnalytics(
    compositionRoot: CompositionRoot,
    onProgressChange: (event: string) => void
) {
    const localInstance = await compositionRoot.instances.getLocal();

    for await (const message of executeAnalytics(localInstance)) {
        onProgressChange(message);
    }

    onProgressChange(i18n.t("Analytics execution finished on {{name}}", localInstance));
}

async function getLastAnalyticsExecution(compositionRoot: CompositionRoot): Promise<string> {
    const systemInfo = await compositionRoot.systemInfo.get();

    return systemInfo.lastAnalyticsTableSuccess ? formatDateLong(systemInfo.lastAnalyticsTableSuccess) : i18n.t("never");
}
