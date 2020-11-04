import React, { useCallback, useMemo } from "react";
import { DataSyncPeriod } from "../../../../../domain/aggregated/types";
import PeriodSelection, { ObjectWithPeriod } from "../../period-selection/PeriodSelection";
import { SyncWizardStepProps } from "../Steps";

const PeriodSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const updatePeriod = useCallback(
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

    const updateStartDate = useCallback(
        (date: Date | null) => {
            onChange(syncRule.updateDataSyncStartDate(date ?? undefined).updateDataSyncEvents([]));
        },
        [onChange, syncRule]
    );

    const updateEndDate = useCallback(
        (date: Date | null) => {
            onChange(syncRule.updateDataSyncEndDate(date ?? undefined).updateDataSyncEvents([]));
        },
        [onChange, syncRule]
    );

    const onFieldChange = useCallback(
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

    const objectWithPeriod = useMemo(() => {
        return {
            period: syncRule.dataSyncPeriod,
            startDate: syncRule.dataSyncStartDate || undefined,
            endDate: syncRule.dataSyncEndDate || undefined,
        };
    }, [syncRule]);

    return <PeriodSelection objectWithPeriod={objectWithPeriod} onFieldChange={onFieldChange} />;
};

export default PeriodSelectionStep;
