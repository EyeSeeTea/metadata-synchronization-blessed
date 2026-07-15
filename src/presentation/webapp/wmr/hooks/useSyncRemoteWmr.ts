import { useLoading } from "@eyeseetea/d2-ui-components";
import React from "react";
import { Id } from "../../../../domain/common/entities/Schemas";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { SynchronizationStats } from "../../../../domain/reports/entities/SynchronizationResult";
import { Maybe } from "../../../../types/utils";
import i18n from "../../../../utils/i18n";
import { useAppContext } from "../../../react/core/contexts/AppContext";
import { useWmrContext } from "../context/WmrContext";
import { useMappingDataElements } from "./useMappingDataElements";

type WmrRemoteSyncResult = { stats?: SynchronizationStats } & (
    | {
          type: "success";
      }
    | {
          type: "error";
          message: string;
      }
    | {
          type: "warning";
      }
);

type UseSyncRemoteWmrOptions = {
    instance: Maybe<Instance>;
    targetOrgUnitId: Maybe<Id>;
};

export function useSyncRemoteWmr(options: UseSyncRemoteWmrOptions) {
    const { instance, targetOrgUnitId } = options;
    const { compositionRoot } = useAppContext();
    const { syncRule } = useWmrContext();
    const loading = useLoading();
    const [wmrRemoteSyncResult, setWmrRemoteSyncResult] = React.useState<WmrRemoteSyncResult | null>(null);
    const { dataElementsToMigrate } = useMappingDataElements("REMOTE");

    React.useEffect(() => {
        if (!syncRule) {
            return;
        }
        // TODO: use this property on sync-rule or remove it?
        syncRule.targetOrgUnitId = targetOrgUnitId;
    }, [syncRule, targetOrgUnitId]);

    const syncRemoteWmr = React.useCallback(async () => {
        if (!instance || !targetOrgUnitId || !syncRule) {
            setWmrRemoteSyncResult({
                type: "error",
                message: i18n.t("Instance or target organisation unit ID is not provided."),
            });
            return;
        }
        const syncRuleUpdated = syncRule?.rule.updateTargetInstances([instance.id]).updateBuilder({
            metadataIds: dataElementsToMigrate,
        });
        loading.show();

        const result = await compositionRoot.sync.prepare(syncRuleUpdated.type, syncRuleUpdated.toBuilder());
        const sync = compositionRoot.wmr.syncDataset(syncRuleUpdated.toBuilder());

        const synchronize = async () => {
            for await (const { message, syncReport, done } of sync.execute(targetOrgUnitId)) {
                if (message) loading.show(true, message);
                if (syncReport) await compositionRoot.reports.save(syncReport);
                if (done) {
                    loading.hide();
                    return syncReport;
                }
            }
        };

        await result.match({
            success: async () => {
                // TODO: Error handling here?
                const report = await synchronize();
                const result = report?.getResults()[0];
                if (result?.status === "ERROR") {
                    setWmrRemoteSyncResult({
                        type: "error",
                        message: result.message ?? "Synchronization result has errors",
                        stats: result.stats,
                    });
                } else if (result?.status === "WARNING") {
                    setWmrRemoteSyncResult({
                        type: "warning",
                        stats: result.stats,
                    });
                } else {
                    setWmrRemoteSyncResult({ type: "success", stats: result?.stats });
                }
                syncRule.rule = syncRuleUpdated;
            },
            error: async code => {
                setWmrRemoteSyncResult({
                    type: "error",
                    message: `Failed to prepare synchronization rule: ${code}`,
                });
            },
        });
    }, [
        instance,
        targetOrgUnitId,
        syncRule,
        loading,
        compositionRoot.sync,
        compositionRoot.wmr,
        compositionRoot.reports,
        dataElementsToMigrate,
    ]);

    return {
        syncRemoteWmr,
        wmrRemoteSyncResult,
    };
}
