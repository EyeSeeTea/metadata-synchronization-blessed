import i18n from "@dhis2/d2-i18n";
import { useD2Api } from "d2-api";
import { ObjectsTable, TableState } from "d2-ui-components";
import _ from "lodash";
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

const columns = [
    { name: "id" as const, text: i18n.t("UID"), sortable: true },
    { name: "orgUnitName" as const, text: i18n.t("Organisation unit"), sortable: true },
    { name: "eventDate" as const, text: i18n.t("Event date"), sortable: true },
    { name: "lastUpdated" as const, text: i18n.t("Last updated"), sortable: true },
    { name: "status" as const, text: i18n.t("Status"), sortable: true },
    { name: "storedBy" as const, text: i18n.t("Stored by"), sortable: true },
];

const details = [
    { name: "id" as const, text: i18n.t("UID") },
    { name: "orgUnitName" as const, text: i18n.t("Organisation unit") },
    { name: "created" as const, text: i18n.t("Created") },
    { name: "lastUpdated" as const, text: i18n.t("Last updated") },
    { name: "eventDate" as const, text: i18n.t("Event date") },
    { name: "dueDate" as const, text: i18n.t("Due date") },
    { name: "status" as const, text: i18n.t("Status") },
    { name: "storedBy" as const, text: i18n.t("Stored by") },
];

export default function EventsSelectionStep({ syncRule, onChange }: EventsSelectionStepProps) {
    const api = useD2Api();
    const [objects, setObjects] = useState<ProgramEvent[]>([]);

    useEffect(() => {
        getEventsData(
            api,
            {
                ...syncRule.dataParams,
                allEvents: true,
            },
            syncRule.metadataIds
        ).then(setObjects);
    }, [api, syncRule]);

    const handleTableChange = (tableState: TableState<ProgramEvent>) => {
        const { selection } = tableState;
        onChange(syncRule.updateDataSyncEvents(selection));
    };

    const updateSyncAll = (value: boolean) => {
        onChange(syncRule.updateDataSyncAllEvents(value).updateDataSyncEvents(undefined));
    };

    const addToSelection = (items: ProgramEvent[]) => {
        const ids = items.map(({ id }) => id);
        const oldSelection = _.difference(syncRule.dataSyncEvents, ids);
        const newSelection = _.difference(ids, syncRule.dataSyncEvents);

        onChange(syncRule.updateDataSyncEvents([...oldSelection, ...newSelection]));
    };

    const actions = [
        {
            name: "select",
            text: i18n.t("Select"),
            primary: true,
            multiple: true,
            onClick: addToSelection,
            isActive: () => false,
        },
    ];

    return (
        <React.Fragment>
            <Toggle
                label={i18n.t("Sync all events")}
                value={syncRule.dataSyncAllEvents}
                onValueChange={updateSyncAll}
            />
            {!syncRule.dataSyncAllEvents && (
                <ObjectsTable<ProgramEvent>
                    rows={objects}
                    columns={columns}
                    details={details}
                    actions={actions}
                    forceSelectionColumn={true}
                    onChange={handleTableChange}
                    selection={syncRule.dataSyncEvents ?? []}
                />
            )}
        </React.Fragment>
    );
}
