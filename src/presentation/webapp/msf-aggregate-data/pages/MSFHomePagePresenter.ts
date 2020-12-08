import { Period } from "../../../../domain/common/entities/Period";
import i18n from "../../../../locales";
import { CompositionRoot } from "../../../CompositionRoot";
import { MSFSettings } from "../../../react/msf-aggregate-data/components/msf-Settings/MSFSettingsDialog";

//TODO: maybe convert to class and presenter to use MVP, MVI pattern
export async function executeAggregateData(
    compositionRoot: CompositionRoot,
    msfSettings: MSFSettings,
    onProgressChange: (progress: string[]) => void,
    period?: Period
) {
    const eventSyncRules = (
        await compositionRoot.rules.list({ filters: { type: "events" }, paging: false })
    ).rows.slice(0, 2);

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
            syncRule.id,
            onSyncRuleProgressChange,
            period
        );
    }

    onProgressChange([...syncProgress, i18n.t(`Finished Aggregate Data`)]);
}

const executeSyncRule = async (
    compositionRoot: CompositionRoot,
    _msfSettings: MSFSettings,
    id: string,
    onProgressChange: (event: string) => void,
    period?: Period
): Promise<void> => {
    const rule = await compositionRoot.rules.get(id);
    if (!rule) return;

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
