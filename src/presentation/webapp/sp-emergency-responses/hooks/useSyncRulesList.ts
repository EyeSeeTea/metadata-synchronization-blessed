import { useSnackbar } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React from "react";
import { EmergencyType, getEmergencyResponseConfig } from "../../../../domain/entities/EmergencyResponses";
import { SynchronizationRule } from "../../../../domain/rules/entities/SynchronizationRule";
import { useAppContext } from "../../../react/core/contexts/AppContext";

export function useSyncRulesList(emergencyType: EmergencyType) {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [rules, setRules] = React.useState<SynchronizationRule[]>([]);

    React.useEffect(() => {
        async function run() {
            const { syncRules } = getEmergencyResponseConfig(emergencyType);

            try {
                const { rows: rules } = await compositionRoot.rules.list({
                    paging: false,
                    sorting: { field: "name", order: "asc" },
                });

                const emergencyResponsesRules = _(rules)
                    .keyBy(rule => rule.code || "")
                    .at([...syncRules.metadata, ...syncRules.data])
                    .compact()
                    .value();

                setRules(emergencyResponsesRules);
            } catch (err: any) {
                snackbar.error(err.message);
            }
        }

        run();
    }, [compositionRoot, snackbar, emergencyType]);

    return rules;
}
