import React from "react";
import { DataSyncPeriod } from "../../../../../domain/aggregated/types";
import { SyncWizardStepProps } from "../Steps";
import PeriodSelection, { ObjectWithPeriod } from "../../period-selection/PeriodSelection";

const PeriodSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const updatePeriod = React.useCallback(
        (period: DataSyncPeriod) => {
            onChange(
                syncRule
                    .updateDataSyncPeriod(period)
                    .updateDataSyncStartDate(undefined)
                    .updateDataSyncEndDate(undefined)
                    .updateDataSyncEvents([])
            );
        },
        [onChange, syncRule]
    );

    const updateStartDate = React.useCallback(
        (date: Date | null) => {
            onChange(syncRule.updateDataSyncStartDate(date ?? undefined).updateDataSyncEvents([]));
        },
        [onChange, syncRule]
    );

    const updateEndDate = React.useCallback(
        (date: Date | null) => {
            onChange(syncRule.updateDataSyncEndDate(date ?? undefined).updateDataSyncEvents([]));
        },
        [onChange, syncRule]
    );

    const onFieldChange = React.useCallback(
        (field: keyof ObjectWithPeriod, value: ObjectWithPeriod[keyof ObjectWithPeriod]) => {
            switch (field) {
                case "period":
                    return updatePeriod(value as ObjectWithPeriod["period"]);
                case "startDate":
                    return updateStartDate((value as ObjectWithPeriod["startDate"]) || null);
                case "endDate":
                    return updateEndDate((value as ObjectWithPeriod["endDate"]) || null);
            }
        },
        [updatePeriod, updateStartDate, updateEndDate]
    );

    const objectWithPeriod = React.useMemo(() => {
        return {
            period: syncRule.dataSyncPeriod,
            startDate: syncRule.dataSyncStartDate || undefined,
            endDate: syncRule.dataSyncEndDate || undefined,
        };
    }, [syncRule]);

    return <PeriodSelection objectWithPeriod={objectWithPeriod} onFieldChange={onFieldChange} />;
};

export default PeriodSelectionStep;
