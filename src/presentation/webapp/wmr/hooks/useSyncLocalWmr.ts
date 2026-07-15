import { useLoading } from "@eyeseetea/d2-ui-components";
import React from "react";
import { useAppContext } from "../../../react/core/contexts/AppContext";
import { useWmrContext } from "../context/WmrContext";
import { useGetDataSetOrgUnits, useMappingDataElements } from "./useMappingDataElements";

type WmrLocalSyncResult =
    | {
          type: "success";
      }
    | {
          type: "error";
          message: string;
      };

export function useSyncLocalWmr() {
    const { compositionRoot } = useAppContext();
    const { settings, syncRule } = useWmrContext();
    const { dataElementsToMigrate } = useMappingDataElements("LOCAL");
    const loading = useLoading();
    const { dataSet: countryDataSet } = useGetDataSetOrgUnits({ id: settings?.countryDataSetId || "" });

    const [wmrLocalSyncResult, setWmrLocalSyncResult] = React.useState<WmrLocalSyncResult | null>(null);

    const syncLocalWmr = React.useCallback(async () => {
        if (!settings || !syncRule || !countryDataSet) {
            throw new Error("WMR settings or sync rule not found");
        }

        const syncRuleUpdated = syncRule.rule
            .updateBuilder({ metadataIds: dataElementsToMigrate })
            // TODO: This is a shortcut to get the root org unit, which is the same as the country WMR dataset.
            .updateDataSyncOrgUnitPaths(countryDataSet.orgUnits.map(ou => ou.path));

        loading.show();
        const result = await compositionRoot.sync.prepare(syncRuleUpdated.type, syncRuleUpdated.toBuilder());
        const sync = compositionRoot.wmr.syncDataset(syncRuleUpdated.toBuilder());

        const synchronize = async () => {
            for await (const { message, syncReport, done } of sync.execute()) {
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
                await synchronize();
                syncRule.rule = syncRuleUpdated;
                setWmrLocalSyncResult({ type: "success" });
            },
            error: async code => {
                loading.hide();
                setWmrLocalSyncResult({
                    type: "error",
                    message: `Failed to prepare synchronization rule: ${code}`,
                });
            },
        });
    }, [
        compositionRoot.reports,
        compositionRoot.sync,
        compositionRoot.wmr,
        countryDataSet,
        dataElementsToMigrate,
        loading,
        settings,
        syncRule,
    ]);

    return {
        syncLocalWmr,
        wmrLocalSyncIsLoading: loading.isLoading,
        wmrLocalSyncResult,
    };
}
