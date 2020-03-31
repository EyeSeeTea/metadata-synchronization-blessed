import i18n from "@dhis2/d2-i18n";
import { Typography } from "@material-ui/core";
import { D2Program, useD2, useD2Api } from "d2-api";
import { ObjectsTable, ObjectsTableDetailField, TableColumn, TableState } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { EventsSync } from "../../../logic/sync/events";
import { D2 } from "../../../types/d2";
import { ProgramEvent } from "../../../types/synchronization";
import { getEventsData } from "../../../utils/synchronization";
import Dropdown from "../../dropdown/Dropdown";
import { Toggle } from "../../toggle/Toggle";
import { SyncWizardStepProps } from "../Steps";

interface ProgramEventObject extends ProgramEvent {
    [key: string]: any;
}

export default function EventsSelectionStep({ syncRule, onChange }: SyncWizardStepProps) {
    const d2 = useD2();
    const api = useD2Api();
    const [objects, setObjects] = useState<ProgramEvent[] | undefined>();
    const [programs, setPrograms] = useState<D2Program[]>([]);
    const [programFilter, changeProgramFilter] = useState<string>("");
    const [error, setError] = useState();

    useEffect(() => {
        getEventsData(
            api,
            {
                ...syncRule.dataParams,
                allEvents: true,
            },
            programs.map(({ id }) => id)
        )
            .then(setObjects)
            .catch(setError);
    }, [api, syncRule, programs]);

    useEffect(() => {
        const sync = new EventsSync(d2 as D2, api, syncRule.toBuilder());
        sync.extractMetadata().then(({ programs = [] }) => setPrograms(programs));
    }, [d2, api, syncRule]);

    const buildAdditionalColumns = () => {
        const program = _.find(programs, { id: programFilter });
        const dataElements = _(program?.programStages ?? [])
            .map(({ programStageDataElements }) =>
                programStageDataElements.map(({ dataElement }) => dataElement)
            )
            .flatten()
            .value();

        return dataElements.map(({ id, displayFormName }) => ({
            name: id,
            text: displayFormName,
            sortable: true,
            hidden: true,
            getValue: (row: ProgramEvent) => {
                return _.find(row.dataValues, { dataElement: id })?.value ?? "-";
            },
        }));
    };

    const handleTableChange = (tableState: TableState<ProgramEvent>) => {
        const { selection } = tableState;
        onChange(syncRule.updateDataSyncEvents(selection.map(({ id }) => id)));
    };

    const updateSyncAll = (value: boolean) => {
        onChange(syncRule.updateDataSyncAllEvents(value).updateDataSyncEvents(undefined));
    };

    const addToSelection = (ids: string[]) => {
        const oldSelection = _.difference(syncRule.dataSyncEvents, ids);
        const newSelection = _.difference(ids, syncRule.dataSyncEvents);

        onChange(syncRule.updateDataSyncEvents([...oldSelection, ...newSelection]));
    };

    const columns: TableColumn<ProgramEvent>[] = [
        { name: "id" as const, text: i18n.t("UID"), sortable: true },
        {
            name: "program" as const,
            text: i18n.t("Program"),
            sortable: true,
            getValue: ({ program }) => _.find(programs, { id: program })?.name ?? program,
        },
        { name: "orgUnitName" as const, text: i18n.t("Organisation unit"), sortable: true },
        { name: "eventDate" as const, text: i18n.t("Event date"), sortable: true },
        {
            name: "lastUpdated" as const,
            text: i18n.t("Last updated"),
            sortable: true,
            hidden: true,
        },
        { name: "status" as const, text: i18n.t("Status"), sortable: true },
        { name: "storedBy" as const, text: i18n.t("Stored by"), sortable: true },
    ];

    const details: ObjectsTableDetailField<ProgramEvent>[] = [
        { name: "id" as const, text: i18n.t("UID") },
        {
            name: "program" as const,
            text: i18n.t("Program"),
            getValue: ({ program }) => _.find(programs, { id: program })?.name ?? program,
        },
        { name: "orgUnitName" as const, text: i18n.t("Organisation unit") },
        { name: "created" as const, text: i18n.t("Created") },
        { name: "lastUpdated" as const, text: i18n.t("Last updated") },
        { name: "eventDate" as const, text: i18n.t("Event date") },
        { name: "dueDate" as const, text: i18n.t("Due date") },
        { name: "status" as const, text: i18n.t("Status") },
        { name: "storedBy" as const, text: i18n.t("Stored by") },
    ];

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

    const filterComponents = (
        <Dropdown
            key={"program-filter"}
            items={programs}
            onValueChange={changeProgramFilter}
            value={programFilter}
            label={i18n.t("Program")}
        />
    );

    const additionalColumns = buildAdditionalColumns();
    const filteredObjects =
        objects?.filter(({ program }) => !programFilter || program === programFilter) ?? [];

    if (error) {
        console.error(error);
        return (
            <Typography>
                {i18n.t("An error ocurred while trying to access the required events")}
            </Typography>
        );
    }

    return (
        <React.Fragment>
            <Toggle
                label={i18n.t("Sync all events")}
                value={syncRule.dataSyncAllEvents}
                onValueChange={updateSyncAll}
            />
            {!syncRule.dataSyncAllEvents && (
                <ObjectsTable<ProgramEventObject>
                    rows={filteredObjects}
                    loading={objects === undefined}
                    columns={[...columns, ...additionalColumns]}
                    details={details}
                    actions={actions}
                    forceSelectionColumn={true}
                    onChange={handleTableChange}
                    selection={syncRule.dataSyncEvents?.map(id => ({ id })) ?? []}
                    filterComponents={filterComponents}
                />
            )}
        </React.Fragment>
    );
}
