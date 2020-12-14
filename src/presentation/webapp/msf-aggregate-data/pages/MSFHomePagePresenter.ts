import SyncRule from "../../../../models/syncRule";
import { CompositionRoot } from "../../../CompositionRoot";
import { D2Api } from "../../../../types/d2-api";
import i18n from "../../../../locales";
import { MSFSettings } from "../../../react/msf-aggregate-data/components/msf-Settings/MSFSettingsDialog";
import { Period } from "../../../../domain/common/entities/Period";

//TODO: maybe convert to class and presenter to use MVP, MVI pattern
export async function executeAggregateData(
    api: D2Api,
    compositionRoot: CompositionRoot,
    msfSettings: MSFSettings,
    onProgressChange: (progress: string[]) => void,
    period?: Period
) {
    const eventSyncRules = (
        await SyncRule.list(api, { type: "events" }, { paging: false })
    ).objects.slice(0, 2);

    let syncProgress: string[] = [i18n.t(`Starting Aggregate Data...`)];

    onProgressChange(syncProgress);

    const onSyncRuleProgressChange = (event: string) => {
        syncProgress = [...syncProgress, event];
        onProgressChange(syncProgress);
    };

    for (const syncRule of eventSyncRules) {
        await executeSyncRule(
            api,
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
    api: D2Api,
    compositionRoot: CompositionRoot,
    _msfSettings: MSFSettings,
    id: string,
    onProgressChange: (event: string) => void,
    period?: Period
): Promise<void> => {
    const rule = await SyncRule.get(api, id);
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
