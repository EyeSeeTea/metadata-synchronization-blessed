import React, { useCallback, useMemo, useState } from "react";
import { DataSyncPeriod } from "../../../../../../domain/aggregated/entities/DataSyncPeriod";
import { PeriodType } from "../../../../../../utils/synchronization";
import PeriodSelection, { ObjectWithPeriod } from "../../period-selection/PeriodSelection";
import { SyncWizardStepProps } from "../Steps";

const PeriodSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const [skipPeriods] = useState<Set<PeriodType> | undefined>(
        syncRule.ondemand ? new Set(["SINCE_LAST_EXECUTED_DATE"]) : undefined
    );

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

    const objectWithPeriod: ObjectWithPeriod = useMemo(() => {
        return {
            period: syncRule.dataSyncPeriod,
            startDate: syncRule.dataSyncStartDate || undefined,
            endDate: syncRule.dataSyncEndDate || undefined,
        };
    }, [syncRule]);

    return (
        <PeriodSelection objectWithPeriod={objectWithPeriod} onFieldChange={onFieldChange} skipPeriods={skipPeriods} />
    );
};

export default PeriodSelectionStep;
