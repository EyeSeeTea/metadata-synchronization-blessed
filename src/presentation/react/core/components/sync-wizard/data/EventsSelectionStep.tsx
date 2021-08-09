import {
    ObjectsTable,
    ObjectsTableDetailField,
    TableColumn,
    TableState,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import { Typography } from "@material-ui/core";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ProgramEvent } from "../../../../../../domain/events/entities/ProgramEvent";
import { DataElement, Program } from "../../../../../../domain/metadata/entities/MetadataEntities";
import { SynchronizationRule } from "../../../../../../domain/rules/entities/SynchronizationRule";
import i18n from "../../../../../../locales";
import { useAppContext } from "../../../contexts/AppContext";
import Dropdown from "../../dropdown/Dropdown";
import { Toggle } from "../../toggle/Toggle";
import { SyncWizardStepProps } from "../Steps";
import { extractAllPrograms } from "../utils";

interface ProgramEventObject extends ProgramEvent {
    [key: string]: any;
}

type CustomProgramStage = {
    id: string;
    displayFormName: string;
    programStageDataElements: { dataElement: DataElement }[];
};

export type CustomProgram = Program & {
    programStages?: CustomProgramStage[];
};

export default function EventsSelectionStep({ syncRule, onChange }: SyncWizardStepProps) {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [memoizedSyncRule] = useState<SynchronizationRule>(syncRule);
    const [objects, setObjects] = useState<ProgramEvent[] | undefined>();
    const [programs, setPrograms] = useState<CustomProgram[]>([]);
    const [programFilter, changeProgramFilter] = useState<string>("");
    const [error, setError] = useState<unknown>();

    useEffect(() => {
        const sync = compositionRoot.sync.events(memoizedSyncRule.toBuilder());

        extractAllPrograms<CustomProgram>(compositionRoot, sync).then(setPrograms);
    }, [memoizedSyncRule, compositionRoot]);

    useEffect(() => {
        if (programs.length === 0) return;

        compositionRoot.instances.getById(syncRule.originInstance).then(result => {
            result.match({
                error: () => snackbar.error(i18n.t("Invalid origin instance")),
                success: instance => {
                    compositionRoot.events
                        .list(
                            instance,
                            {
                                ...memoizedSyncRule.dataParams,
                                allEvents: true,
                            },
                            programs.map(program => program.programStages.map(({ id }) => id)).flat()
                        )
                        .then(setObjects)
                        .catch(setError);
                },
            });
        });
    }, [compositionRoot, memoizedSyncRule, programs, snackbar, syncRule.originInstance]);

    const handleTableChange = useCallback(
        (tableState: TableState<ProgramEvent>) => {
            const { selection } = tableState;
            onChange(syncRule.updateDataSyncEvents(selection.map(({ id }) => id)));
        },
        [onChange, syncRule]
    );

    const updateSyncAll = useCallback(
        (value: boolean) => {
            onChange(syncRule.updateDataSyncAllEvents(value).updateDataSyncEvents(undefined));
        },
        [onChange, syncRule]
    );

    const addToSelection = useCallback(
        (ids: string[]) => {
            const oldSelection = _.difference(syncRule.dataSyncEvents, ids);
            const newSelection = _.difference(ids, syncRule.dataSyncEvents);

            onChange(syncRule.updateDataSyncEvents([...oldSelection, ...newSelection]));
        },
        [onChange, syncRule]
    );

    const columns: TableColumn<ProgramEvent>[] = useMemo(
        () => [
            { name: "id" as const, text: i18n.t("UID"), sortable: true },
            {
                name: "program" as const,
                text: i18n.t("Program"),
                sortable: true,
                getValue: ({ program, programStage }) => {
                    const programObj = programs.find(program =>
                        program.programStages.some(stage => stage.id === programStage)
                    );

                    const stage = (programObj?.programStages ?? []).find(
                        stage => stage.id === programStage
                    ) as CustomProgramStage;

                    return programObj && stage
                        ? programObj.programType === "WITH_REGISTRATION"
                            ? `${programObj.name} [${stage.displayFormName}]`
                            : programObj.name
                        : program;
                },
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
        ],
        [programs]
    );

    const details: ObjectsTableDetailField<ProgramEvent>[] = useMemo(
        () => [
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
        ],
        [programs]
    );

    const actions = useMemo(
        () => [
            {
                name: "select",
                text: i18n.t("Select"),
                primary: true,
                multiple: true,
                onClick: addToSelection,
                isActive: () => false,
            },
        ],
        [addToSelection]
    );

    const filterComponents = useMemo(
        () => (
            <Dropdown
                key={"program-filter"}
                items={programs}
                onValueChange={changeProgramFilter}
                value={programFilter}
                label={i18n.t("Program")}
            />
        ),
        [programFilter, programs]
    );

    const additionalColumns = useMemo(() => {
        const program = _.find(programs, { id: programFilter });
        const dataElements = _(program?.programStages ?? [])
            .map(({ programStageDataElements }) => programStageDataElements.map(({ dataElement }) => dataElement))
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
    }, [programFilter, programs]);

    const filteredObjects = objects?.filter(({ program }) => !programFilter || program === programFilter) ?? [];

    if (error) {
        console.error(error);
        return <Typography>{i18n.t("An error ocurred while trying to access the required events")}</Typography>;
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
