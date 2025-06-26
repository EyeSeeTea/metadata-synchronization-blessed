import { makeStyles, Typography } from "@material-ui/core";
import {
    ObjectsTable,
    ObjectsTableDetailField,
    TableColumn,
    TablePagination,
    TableState,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import i18n from "../../../../../../utils/i18n";
import { SyncWizardStepProps } from "../Steps";
import { TrackedEntityInstance } from "../../../../../../domain/tracked-entity-instances/entities/TrackedEntityInstance";
import _ from "lodash";
import { SynchronizationRule } from "../../../../../../domain/rules/entities/SynchronizationRule";
import { Program } from "../../../../../../domain/metadata/entities/MetadataEntities";
import { useAppContext } from "../../../contexts/AppContext";
import Dropdown from "../../dropdown/Dropdown";
import { Toggle } from "../../toggle/Toggle";
import moment from "moment";
import { extractAllPrograms } from "../utils";

interface TEIObject extends TrackedEntityInstance {
    id: string;
    [key: string]: any;
}

export default function TEIsSelectionStep({ syncRule, onChange }: SyncWizardStepProps) {
    const classes = useStyles();
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [memoizedSyncRule] = useState<SynchronizationRule>(syncRule);
    const [rows, setRows] = useState<TEIObject[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [programFilter, setProgramFilter] = useState<string>("");
    const [error, setError] = useState<unknown>();
    const [paginationFilters, setPaginationFilters] = useState({ page: 1, pageSize: 25 });
    const [pager, setPager] = useState<Partial<TablePagination>>({});
    const [rowsLoading, setRowsLoading] = useState(false);

    useEffect(() => {
        const sync = compositionRoot.sync.events(memoizedSyncRule.toBuilder());
        extractAllPrograms<Program>(compositionRoot, sync).then(programs => {
            setPrograms(programs.filter(program => program.programType === "WITH_REGISTRATION"));
        });
    }, [memoizedSyncRule, compositionRoot]);

    useEffect(() => {
        if (programs.length === 1) {
            setProgramFilter(programs[0].id);
        }
    }, [compositionRoot, memoizedSyncRule, programs]);

    useEffect(() => {
        if (programFilter) {
            setRowsLoading(true);
            compositionRoot.instances.getById(syncRule.originInstance).then(result => {
                result.match({
                    error: () => snackbar.error(i18n.t("Invalid origin instance")),
                    success: instance => {
                        compositionRoot.teis
                            .list(
                                {
                                    ...memoizedSyncRule.dataParams,
                                },
                                programFilter,
                                instance,
                                paginationFilters.page,
                                paginationFilters.pageSize
                            )
                            .then(teisResponse => {
                                setPager({
                                    page: teisResponse.page,
                                    pageSize: teisResponse.pageSize,
                                    total: teisResponse.total,
                                });
                                setRows(
                                    teisResponse.instances.map(tei => ({
                                        ...tei,
                                        id: tei.trackedEntity,
                                    }))
                                );
                                setRowsLoading(false);
                            })
                            .catch(setError);
                    },
                });
            });
        } else {
            setRows([]);
        }
    }, [
        compositionRoot,
        programFilter,
        memoizedSyncRule.dataParams,
        syncRule.originInstance,
        snackbar,
        paginationFilters,
    ]);

    const handleTableChange = useCallback(
        (tableState: TableState<TEIObject>) => {
            const { selection, pagination } = tableState;
            onChange(syncRule.updateDataSyncTEIs(selection.map(({ id }) => id)));
            setPaginationFilters({ page: pagination.page, pageSize: pagination.pageSize });
        },
        [onChange, syncRule]
    );

    const excludeTeiRelationships = useCallback(
        (value: boolean) => {
            onChange(syncRule.updateExcludeTeiRelationships(value));
        },
        [onChange, syncRule]
    );

    const addToSelection = useCallback(
        (ids: string[]) => {
            const oldSelection = _.difference(syncRule.dataSyncTeis, ids);
            const newSelection = _.difference(ids, syncRule.dataSyncTeis);

            onChange(syncRule.updateDataSyncTEIs([...oldSelection, ...newSelection]));
        },
        [onChange, syncRule]
    );

    const updateSyncAllTEIs = useCallback(
        (value: boolean) => {
            onChange(syncRule.updateDataSyncAllTEIs(value));
        },
        [onChange, syncRule]
    );

    const attributes = useMemo(
        () =>
            _(
                rows
                    .map(tei =>
                        tei.attributes.map(att => ({
                            attribute: att.attribute,
                            displayName: att.displayName,
                        }))
                    )
                    .flat()
            )
                .uniqBy("attribute")
                .value(),
        [rows]
    );

    const columns: TableColumn<TEIObject>[] = useMemo(
        () => [
            { name: "id" as const, text: i18n.t("UID"), sortable: true },
            {
                name: "enrollmentDate" as const,
                text: i18n.t("Enrollment Date"),
                sortable: true,
                getValue: (tei: TrackedEntityInstance) => moment(tei.enrollments[0].enrolledAt).format("YYYY-MM-DD"),
            },
            ...attributes.map(columnAtt => {
                return {
                    name: columnAtt.attribute,
                    text: columnAtt.displayName,
                    sortable: true,
                    getValue: (tei: TrackedEntityInstance) =>
                        tei.attributes.find(att => att.attribute === columnAtt.attribute)?.value || "",
                };
            }),
        ],
        [attributes]
    );

    const details: ObjectsTableDetailField<TEIObject>[] = useMemo(
        () => [
            { name: "id" as const, text: i18n.t("UID") },
            ...attributes.map(columnAtt => {
                return {
                    name: columnAtt.attribute,
                    text: columnAtt.displayName,
                    getValue: (tei: TrackedEntityInstance) =>
                        tei.attributes.find(att => att.attribute === columnAtt.attribute)?.value || "",
                };
            }),
        ],
        [attributes]
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
                onValueChange={setProgramFilter}
                value={programFilter}
                label={i18n.t("Program")}
            />
        ),
        [programFilter, programs]
    );

    if (error) {
        console.error(error);
        return <Typography>{i18n.t("An error ocurred while trying to access the required events")}</Typography>;
    }

    return (
        <React.Fragment>
            <Toggle
                label={i18n.t("Sync all TEIs")}
                value={syncRule.dataSyncAllTEIs}
                onValueChange={updateSyncAllTEIs}
            />

            {!syncRule.dataSyncAllTEIs && (
                <React.Fragment>
                    <ObjectsTable<TEIObject>
                        rows={rows}
                        loading={rowsLoading}
                        columns={columns}
                        details={details}
                        actions={actions}
                        forceSelectionColumn={true}
                        onChange={handleTableChange}
                        selection={syncRule.dataSyncTeis?.map(id => ({ id })) ?? []}
                        filterComponents={filterComponents}
                        pagination={pager}
                    />

                    <Typography className={classes.advancedOptionsTitle} variant={"subtitle1"} gutterBottom>
                        {i18n.t("Advanced options")}
                    </Typography>

                    <Toggle
                        label={i18n.t("Exclude relationships")}
                        value={syncRule.excludeTeiRelationships}
                        onValueChange={excludeTeiRelationships}
                    />
                </React.Fragment>
            )}
        </React.Fragment>
    );
}

const useStyles = makeStyles({
    advancedOptionsTitle: {
        fontWeight: 500,
    },
});
