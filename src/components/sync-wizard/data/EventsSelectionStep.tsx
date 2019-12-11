import i18n from "@dhis2/d2-i18n";
import { D2Api, useD2Api } from "d2-api";
import { ObjectsTable } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import SyncRule from "../../../models/syncRule";

interface EventsSelectionStepProps {
    syncRule: SyncRule;
    onChange: (syncRule: SyncRule) => void;
    type: "dataElements" | "programs";
}

interface Event {
    id: string;
    event: string;
    orgUnit: string;
    orgUnitName: string;
    created: string;
    lastUpdated: string;
    status: string;
    storedBy: string;
    dueDate: string;
}

export async function getAllEvents(
    api: D2Api,
    programs: string[],
    orgUnits: string[]
): Promise<Event[]> {
    const events = [];

    for (const program of programs) {
        const { events: response } = (await api
            .get("/events", {
                paging: false,
                program,
            })
            .getData()) as { events: Event[] };

        events.push(...response);
    }

    return events
        .filter(({ orgUnit }) => orgUnits.includes(orgUnit))
        .map(event => ({ ...event, id: event.event }));
}

export default function EventsSelectionStep(props: EventsSelectionStepProps) {
    const { syncRule } = props;
    const api = useD2Api();
    const [page, setPage] = useState(1);
    const [objects, setObjects] = useState<Event[]>([]);

    useEffect(() => {
        const orgUnits = _.compact(
            syncRule.dataSyncOrgUnitPaths.map(path => _.last(path.split("/")))
        );
        getAllEvents(api, syncRule.metadataIds, orgUnits).then(setObjects);
    }, [api, syncRule]);

    return (
        <ObjectsTable<Event>
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
            pagination={{ total: objects.length, page, pageSize: 10, pageSizeOptions: [10] }}
            onChange={({ pagination }) => setPage(pagination.page)}
        />
    );
}
