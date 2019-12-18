import i18n from "@dhis2/d2-i18n";
import { DatePicker } from "d2-ui-components";
import React from "react";
import SyncRule from "../../../models/syncRule";

interface PeriodSelectionStepProps {
    syncRule: SyncRule;
    onChange: (syncRule: SyncRule) => void;
}

export default function PeriodSelectionStep(props: PeriodSelectionStepProps) {
    const { syncRule, onChange } = props;

    const updateStartDate = (date: Date | null) => {
        onChange(syncRule.updateDataSyncStartDate(date || undefined));
    };

    const updateEndDate = (date: Date | null) => {
        onChange(syncRule.updateDataSyncEndDate(date || undefined));
    };

    const mandatory = syncRule.type === "aggregated" ? " (*)" : "";

    return (
        <React.Fragment>
            <div>
                <DatePicker
                    label={i18n.t("Start date") + mandatory}
                    value={syncRule.dataSyncStartDate || null}
                    onChange={updateStartDate}
                />
            </div>
            <div>
                <DatePicker
                    label={i18n.t("End date") + mandatory}
                    value={syncRule.dataSyncEndDate || null}
                    onChange={updateEndDate}
                />
            </div>
        </React.Fragment>
    );
}
