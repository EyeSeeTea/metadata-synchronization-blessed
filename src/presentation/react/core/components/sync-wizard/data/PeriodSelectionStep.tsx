import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { DataSyncPeriod } from "../../../../../../domain/aggregated/entities/DataSyncPeriod";
import { PeriodType } from "../../../../../../utils/synchronization";
import PeriodSelection, { ObjectWithPeriod } from "../../period-selection/PeriodSelection";
import { SyncWizardStepProps } from "../Steps";
import Dropdown, { DropdownOption } from "../../dropdown/Dropdown";
import i18n from "../../../../../../utils/i18n";
import { TeisSyncPeriodField } from "../../../../../../domain/aggregated/entities/TeisSyncPeriodField";
import { EventsSyncPeriodField } from "../../../../../../domain/aggregated/entities/EventsSyncPeriodField";

const PeriodSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const [skipPeriods] = useState<Set<PeriodType> | undefined>(
        syncRule.ondemand ? new Set(["SINCE_LAST_EXECUTED_DATE", "SINCE_LAST_SUCCESSFUL_SYNC"]) : undefined
    );

    const updatePeriod = useCallback(
        (period: DataSyncPeriod) => {
            onChange(
                syncRule
                    .updateDataSyncPeriod(period)
                    .updateDataSyncStartDate(undefined)
                    .updateDataSyncEndDate(undefined)
                    .updateDataSyncEvents([])
                    .updateTeisSyncPeriodField(undefined)
                    .updateEventsSyncPeriodField(undefined)
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

    const updateTeisSyncPeriodField = useCallback(
        (teisSyncPeriodField: TeisSyncPeriodField) => {
            onChange(syncRule.updateTeisSyncPeriodField(teisSyncPeriodField).updateDataSyncEvents([]));
        },
        [onChange, syncRule]
    );

    const updateEventsSyncPeriodField = useCallback(
        (eventsSyncPeriodField: EventsSyncPeriodField) => {
            onChange(syncRule.updateEventsSyncPeriodField(eventsSyncPeriodField).updateDataSyncEvents([]));
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

    const teisSyncPeriodFieldOptions: DropdownOption<TeisSyncPeriodField>[] = useMemo(() => {
        return [
            { name: i18n.t("Enrollment date"), id: "ENROLLMENT_DATE" },
            { name: i18n.t("Last updated date"), id: "LAST_UPDATED" },
        ];
    }, []);

    const eventsSyncPeriodFieldOptions: DropdownOption<EventsSyncPeriodField>[] = useMemo(() => {
        return [
            { name: i18n.t("Occurred event date"), id: "OCCURRED_EVENT_DATE" },
            { name: i18n.t("Last updated date"), id: "LAST_UPDATED" },
        ];
    }, []);

    return (
        <Container>
            <PeriodSelection
                objectWithPeriod={objectWithPeriod}
                onFieldChange={onFieldChange}
                skipPeriods={skipPeriods}
            />
            {objectWithPeriod.period === "SINCE_LAST_SUCCESSFUL_SYNC" && syncRule.metadataTypes.includes("programs") ? (
                <>
                    <Dropdown
                        label={i18n.t("Tracked entities sync period field")}
                        items={teisSyncPeriodFieldOptions}
                        value={syncRule.teisSyncPeriodField || null}
                        onValueChange={updateTeisSyncPeriodField}
                        hideEmpty={true}
                    />
                    <Dropdown
                        label={i18n.t("Events sync period field")}
                        items={eventsSyncPeriodFieldOptions}
                        value={syncRule.eventsSyncPeriodField || null}
                        onValueChange={updateEventsSyncPeriodField}
                        hideEmpty={true}
                    />
                </>
            ) : null}
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 50px;
    max-width: fit-content;
`;

export default PeriodSelectionStep;
