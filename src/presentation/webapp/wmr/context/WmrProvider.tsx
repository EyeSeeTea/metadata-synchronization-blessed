import { useSnackbar } from "@eyeseetea/d2-ui-components";
import React from "react";
import { WmrSettings } from "../../../../domain/entities/wmr/entities/WmrSettings";
import { SynchronizationRule } from "../../../../domain/rules/entities/SynchronizationRule";
import { Maybe } from "../../../../types/utils";
import { useAppContext } from "../../../react/core/contexts/AppContext";
import { WmrContext, WmrSyncRule } from "./WmrContext";

export function WmrProvider({ children }: { children: React.ReactNode }) {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [settings, setSettings] = React.useState<Maybe<WmrSettings>>();
    const [requisitesReady, setRequisitesReady] = React.useState<boolean>(false);
    const syncRuleRef = React.useRef<WmrSyncRule>({
        localDataSetId: undefined,
        targetOrgUnitId: undefined,
        rule: SynchronizationRule.createOnDemand("aggregated")
            .updateBuilder({ metadataIds: [] })
            .updateMetadataTypes(["dataElements"])
            .updateDataSyncOrgUnitPaths([])
            .updateDataSyncPeriod("LAST_YEAR")
            .updateTargetInstances([WmrSettings.LOCAL_INSTANCE_ID]),
    });

    const loadSettings = React.useCallback(() => {
        compositionRoot.wmr
            .settings()
            .then(setSettings)
            .catch(err => {
                snackbar.error(err.message);
            });
    }, [compositionRoot, setSettings, snackbar]);

    return (
        <WmrContext.Provider
            value={{
                loadSettings,
                settings,
                syncRule: syncRuleRef.current,
                requisitesReady,
                setRequisitesReady,
            }}
        >
            {children}
        </WmrContext.Provider>
    );
}
