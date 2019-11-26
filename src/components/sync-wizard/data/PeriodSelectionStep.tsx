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
        onChange(syncRule.updateDataSyncStartDate(date));
    };

    const updateEndDate = (date: Date | null) => {
        onChange(syncRule.updateDataSyncEndDate(date));
    };

    return (
        <React.Fragment>
            <div>
                <DatePicker
                    label={i18n.t("Start date (*)")}
                    value={syncRule.dataSyncStartDate}
                    onChange={updateStartDate}
                />
            </div>
            <div>
                <DatePicker
                    label={i18n.t("End date (*)")}
                    value={syncRule.dataSyncEndDate}
                    onChange={updateEndDate}
                />
            </div>
        </React.Fragment>
    );
}
