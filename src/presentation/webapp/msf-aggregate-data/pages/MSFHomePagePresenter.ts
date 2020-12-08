import _ from "lodash";
import { Period } from "../../../../domain/common/entities/Period";
import { SynchronizationRule } from "../../../../domain/rules/entities/SynchronizationRule";
import i18n from "../../../../locales";
import { promiseMap } from "../../../../utils/common";
import { CompositionRoot } from "../../../CompositionRoot";
import { MSFSettings } from "../../../react/msf-aggregate-data/components/msf-Settings/MSFSettingsDialog";

//TODO: maybe convert to class and presenter to use MVP, MVI pattern
export async function executeAggregateData(
    compositionRoot: CompositionRoot,
    msfSettings: MSFSettings,
    onProgressChange: (progress: string[]) => void,
    period?: Period
) {
    const eventSyncRules = await getSyncRules(compositionRoot);

    let syncProgress: string[] = [i18n.t(`Starting Aggregate Data...`)];

    onProgressChange(syncProgress);

    const onSyncRuleProgressChange = (event: string) => {
        syncProgress = [...syncProgress, event];
        onProgressChange(syncProgress);
    };

    for (const syncRule of eventSyncRules) {
        await executeSyncRule(
            compositionRoot,
            msfSettings,
            syncRule,
            onSyncRuleProgressChange,
            period
        );
    }

    onProgressChange([...syncProgress, i18n.t(`Finished Aggregate Data`)]);
}

async function executeSyncRule(
    compositionRoot: CompositionRoot,
    _msfSettings: MSFSettings,
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

    console.log({ newBuilder });

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
};

async function getSyncRules(compositionRoot: CompositionRoot,): Promise<SynchronizationRule[]> {
    const rulesList = (
        await compositionRoot.rules.list({ filters: { type: "events" }, paging: false })
    ).rows.slice(0, 2);

    const rules = await promiseMap(rulesList, rule => {
        return compositionRoot.rules.get(rule.id)
    });

    return _.compact(rules);
}
