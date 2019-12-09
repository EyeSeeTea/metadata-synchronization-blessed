import i18n from "@dhis2/d2-i18n";
import { useD2Api, useD2ApiData, useD2 } from "d2-api";
import { ObjectsTable } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import SyncRule from "../../../models/syncRule";
import { getCurrentUserOrganisationUnits } from "../../../utils/d2";
import { D2 } from "../../../types/d2";

interface EventsSelectionStepProps {
    syncRule: SyncRule;
    onChange: (syncRule: SyncRule) => void;
    type: "dataElements" | "programs";
}

/** Dummy step, this is not final code */

export default function EventsSelectionStep(props: EventsSelectionStepProps) {
    const { syncRule } = props;
    const api = useD2Api();
    const d2 = useD2();
    const [organisationUnitsRootIds, setOrganisationUnitsRootIds] = useState<string[]>([]);
    const [page, setPage] = useState(1);

    const { loading, data, error, refetch } = useD2ApiData();

    const orgUnit = useMemo(
        () => _.compact(syncRule.dataSyncOrgUnitPaths.map(path => _.last(path.split("/")))),
        [syncRule.dataSyncOrgUnitPaths]
    );

    useEffect(() => {
        if (organisationUnitsRootIds.length > 0)
            refetch(
                api.get("/events", {
                    paging: false,
                    orgUnit: organisationUnitsRootIds[0],
                    ouMode: "CHILDREN",
                })
            );
    }, [api, refetch, orgUnit, organisationUnitsRootIds]);

    useEffect(() => {
        getCurrentUserOrganisationUnits(d2 as D2).then(setOrganisationUnitsRootIds);
    }, [d2]);

    if (error) return error;

    const { events } = data || { events: [] };

    const objects = _(events)
        .filter(
            ({ program, programStage }) =>
                syncRule.metadataIds.includes(program) ||
                syncRule.metadataIds.includes(programStage)
        )
        .filter(({ orgUnit }) =>
            _.compact(syncRule.dataSyncOrgUnitPaths.map(path => _.last(path.split("/")))).includes(
                orgUnit
            )
        )
        .map(event => ({ ...event, id: event.event }))
        .value();

    return (
        <ObjectsTable<{
            id: string;
            orgUnitName: string;
            created: string;
            lastUpdated: string;
            status: string;
            storedBy: string;
            dueDate: string;
        }>
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
            loading={loading}
            pagination={{ total: objects.length, page, pageSize: 10, pageSizeOptions: [10] }}
            onChange={({ pagination }) => setPage(pagination.page)}
        />
    );
}
