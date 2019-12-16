import i18n from "@dhis2/d2-i18n";
import { useD2Api } from "d2-api";
import { ObjectsTable, TableState } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import SyncRule from "../../../models/syncRule";
import { ProgramEvent } from "../../../types/synchronization";
import { getEventsData } from "../../../utils/synchronization";
import { Toggle } from "../../toggle/Toggle";

interface EventsSelectionStepProps {
    syncRule: SyncRule;
    onChange: (syncRule: SyncRule) => void;
    type: "dataElements" | "programs";
}

export default function EventsSelectionStep({ syncRule, onChange }: EventsSelectionStepProps) {
    const api = useD2Api();
    const [page, setPage] = useState(1);
    const [objects, setObjects] = useState<ProgramEvent[]>([]);

    useEffect(() => {
        getEventsData(
            api,
            {
                orgUnitPaths: syncRule.dataSyncOrgUnitPaths,
                startDate: syncRule.dataSyncStartDate ?? undefined,
                endDate: syncRule.dataSyncEndDate ?? undefined,
                allEvents: true,
            },
            syncRule.metadataIds
        ).then(setObjects);
    }, [api, syncRule]);

    const handleTableChange = (tableState: TableState<ProgramEvent>) => {
        const { selection, pagination } = tableState;
        onChange(syncRule.updateDataSyncEvents(selection));
        setPage(pagination.page);
    };

    const updateSyncAll = (value: boolean) => {
        onChange(syncRule.updateDataSyncAllEvents(value).updateDataSyncEvents(undefined));
    };

    return (
        <React.Fragment>
            <Toggle
                label={i18n.t("Sync all events")}
                value={syncRule.dataSyncAllEvents}
                onValueChange={updateSyncAll}
            />
            {!syncRule.dataSyncAllEvents && (
                <ObjectsTable<ProgramEvent>
                    rows={objects.slice(10 * (page - 1), 10 * page)}
                    columns={[
                        { name: "id", text: i18n.t("UID"), sortable: true },
                        { name: "orgUnitName", text: i18n.t("Organisation unit"), sortable: true },
                        { name: "lastUpdated", text: i18n.t("Last updated"), sortable: true },
                        { name: "status", text: i18n.t("Status"), sortable: true },
                        { name: "storedBy", text: i18n.t("Stored by"), sortable: true },
                    ]}
                    details={[
                        { name: "id", text: i18n.t("UID") },
                        { name: "orgUnitName", text: i18n.t("Organisation unit") },
                        { name: "created", text: i18n.t("Created") },
                        { name: "lastUpdated", text: i18n.t("Last updated") },
                        { name: "status", text: i18n.t("Status") },
                        { name: "storedBy", text: i18n.t("Stored by") },
                        { name: "dueDate", text: i18n.t("Due date") },
                    ]}
                    forceSelectionColumn={true}
                    pagination={{
                        total: objects.length,
                        page,
                        pageSize: 10,
                        pageSizeOptions: [10],
                    }}
                    onChange={handleTableChange}
                    selection={syncRule.dataSyncEvents ?? []}
                />
            )}
        </React.Fragment>
    );
}
