import i18n from "@dhis2/d2-i18n";
import { Fab, Icon, IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core";
import { useD2Api } from "d2-api";
import {
    ConfirmationDialog,
    TableAction,
    TableColumn,
    useSnackbar,
    useLoading,
} from "d2-ui-components";
import _ from "lodash";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import MappingDialog from "../../components/mapping-dialog/MappingDialog";
import MappingWizard from "../../components/mapping-wizard/MappingWizard";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import { D2Model, DataElementModel } from "../../models/d2Model";
import Instance, { MetadataMapping, MetadataMappingDictionary } from "../../models/instance";
import { MetadataType } from "../../utils/d2";
import { cleanOrgUnitPath } from "../../utils/synchronization";
import { autoMap, buildMapping } from "./utils";

const useStyles = makeStyles({
    iconButton: {
        padding: 0,
        paddingLeft: 8,
        paddingRight: 8,
    },
    instanceDropdown: {
        order: 0,
    },
    actionButtons: {
        order: 10,
        marginRight: 10,
    },
});

interface WarningDialog {
    title?: string;
    description?: string;
    action?: () => void;
}

export interface MappingTableProps {
    instance: Instance;
    models: typeof D2Model[];
    filterRows?: string[];
    mapping: MetadataMappingDictionary;
    onChangeMapping(mapping: MetadataMappingDictionary): Promise<void>;
    isChildrenMapping?: boolean;
    mappingPath?: string[];
}

export default function MappingTable({
    instance,
    models,
    filterRows,
    mapping,
    onChangeMapping,
    isChildrenMapping = false,
    mappingPath,
}: MappingTableProps) {
    const api = useD2Api();
    const classes = useStyles();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [model, setModel] = useState<typeof D2Model>(() => models[0] ?? DataElementModel);
    const type = model.getCollectionName();
    const instanceApi = instance.getApi();

    const [isLoading, setLoading] = useState<boolean>(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [warningDialog, setWarningDialog] = useState<WarningDialog | null>(null);
    const [elementsToMap, setElementsToMap] = useState<string[]>([]);
    const [rows, setRows] = useState<MetadataType[]>([]);

    const [relatedMapping, setRelatedMapping] = useState<string[]>();

    const applyMapping = useCallback(
        async (selection: string[], mappedId: string | undefined) => {
            loading.show(true, i18n.t("Applying mapping update"));
            try {
                const newMapping = _.cloneDeep(mapping);
                for (const id of selection) {
                    _.unset(newMapping, [type, id]);
                    if (isChildrenMapping || mappedId) {
                        const mapping = await buildMapping(api, instanceApi, model, id, mappedId);
                        _.set(newMapping, [type, id], mapping);
                    }
                }

                await onChangeMapping(newMapping);
                setSelectedIds([]);

                const action = mappedId ? i18n.t("Set") : i18n.t("Reset to default");
                const operation = mappedId === "DISABLED" ? i18n.t("Disabled") : action;

                snackbar.info(
                    i18n.t("{{operation}} mapping for {{total}} elements", {
                        operation,
                        total: selection.length,
                    }),
                    { autoHideDuration: 2500 }
                );
            } catch (e) {
                console.error(e);
                snackbar.error(i18n.t("Could not apply mapping, please try again."));
            }
            loading.reset();
        },
        [
            api,
            instanceApi,
            snackbar,
            loading,
            type,
            model,
            mapping,
            isChildrenMapping,
            onChangeMapping,
        ]
    );

    const updateMapping = useCallback(
        async (mappedId?: string) => {
            applyMapping(elementsToMap, mappedId);
        },
        [applyMapping, elementsToMap]
    );

    const disableMapping = useCallback(
        async (selection: string[]) => {
            if (selection.length > 0) {
                setWarningDialog({
                    title: i18n.t("Disable mapping"),
                    description: i18n.t(
                        "Are you sure you want to disable mapping for {{total}} elements?",
                        {
                            total: selection.length,
                        }
                    ),
                    action: () => applyMapping(selection, "DISABLED"),
                });
            } else {
                snackbar.error(i18n.t("Please select at least one item to disable mapping"));
            }
        },
        [snackbar, applyMapping]
    );

    const resetMapping = useCallback(
        async (selection: string[]) => {
            if (selection.length > 0) {
                setWarningDialog({
                    title: i18n.t("Reset mapping"),
                    description: i18n.t(
                        "Are you sure you want to reset mapping for {{total}} elements?",
                        {
                            total: selection.length,
                        }
                    ),
                    action: () => applyMapping(selection, undefined),
                });
            } else {
                snackbar.error(i18n.t("Please select at least one item to reset mapping"));
            }
        },
        [snackbar, applyMapping]
    );

    const applyAutoMapping = useCallback(
        async (selection: string[]) => {
            const selectedItem = _.find(rows, ["id", selection[0]]);

            if (selection.length !== 1) {
                snackbar.error(i18n.t("Auto-mapping does not support multiple action yet"), {
                    autoHideDuration: 2500,
                });
                return;
            } else if (!selectedItem) {
                snackbar.error(i18n.t("Unexpected error, could not apply auto mapping"), {
                    autoHideDuration: 2500,
                });
                return;
            }

            const { mappedId: candidate } =
                (await autoMap(instanceApi, model, selectedItem))[0] ?? {};
            if (!candidate) {
                snackbar.error(i18n.t("Could not find a suitable candidate to apply auto-mapping"));
            } else {
                await applyMapping(selection, candidate);
                setElementsToMap(selection);
            }
        },
        [applyMapping, instanceApi, rows, snackbar, model]
    );

    const openMappingDialog = useCallback((selection: string[]) => {
        setElementsToMap(selection);
        setSelectedIds([]);
    }, []);

    const openRelatedMapping = useCallback(
        (selection: string[]) => {
            const id = _.first(selection);

            if (!id || !mapping[type][id]?.mapping) {
                snackbar.error(
                    i18n.t(
                        "You need to map this element before accessing its related metadata mapping"
                    )
                );
            } else {
                setRelatedMapping([type, id]);
            }
        },
        [mapping, type, snackbar]
    );

    const columns: TableColumn<MetadataType>[] = useMemo(
        () => [
            {
                name: "id",
                text: "ID",
            },
            {
                name: "mapped-id",
                text: "Mapped ID",
                getValue: (row: MetadataType) => {
                    const mappedId = _.get(mapping, [type, row.id, "mappedId"], row.id);
                    const cleanId = cleanOrgUnitPath(mappedId);
                    const name = cleanId === "DISABLED" ? i18n.t("Disabled") : cleanId;

                    return (
                        <span>
                            <Typography variant={"inherit"} gutterBottom>
                                {name}
                            </Typography>
                            <Tooltip title={i18n.t("Set mapping")} placement="top">
                                <IconButton
                                    className={classes.iconButton}
                                    onClick={event => {
                                        event.stopPropagation();
                                        openMappingDialog([row.id]);
                                    }}
                                >
                                    <Icon color="primary">open_in_new</Icon>
                                </IconButton>
                            </Tooltip>
                        </span>
                    );
                },
            },
            {
                name: "mapped-name",
                text: "Mapped Name",
                getValue: (row: MetadataType) => {
                    const {
                        mappedId = row.id,
                        name = mappedId === "DISABLED" ? undefined : i18n.t("Not mapped"),
                        conflicts = false,
                        mapping: childrenMapping,
                    }: Partial<MetadataMapping> = _.get(mapping, [type, row.id]) ?? {};

                    const childrenConflicts = _(childrenMapping)
                        .values()
                        .map(Object.values)
                        .flatten()
                        .some(["conflicts", true]);
                    const showConflicts = conflicts || childrenConflicts;

                    return (
                        <span>
                            <Typography variant={"inherit"} gutterBottom>
                                {name ?? "-"}
                            </Typography>
                            {showConflicts && (
                                <Tooltip title={i18n.t("Mapping has errors")} placement="top">
                                    <IconButton
                                        className={classes.iconButton}
                                        onClick={event => {
                                            event.stopPropagation();
                                            if (!isChildrenMapping) openRelatedMapping([row.id]);
                                        }}
                                    >
                                        <Icon color="error">warning</Icon>
                                    </IconButton>
                                </Tooltip>
                            )}
                        </span>
                    );
                },
            },
        ],
        [classes, type, mapping, openMappingDialog, isChildrenMapping, openRelatedMapping]
    );

    const filters: ReactNode = useMemo(
        () => (
            <React.Fragment>
                {!isChildrenMapping && (
                    <Fab
                        className={classes.actionButtons}
                        color="primary"
                        onClick={() => resetMapping(rows.map(({ id }) => id))}
                        variant={"extended"}
                    >
                        {i18n.t("Reset mapping")}
                    </Fab>
                )}
                {!isChildrenMapping && (
                    <Fab
                        className={classes.actionButtons}
                        color="primary"
                        onClick={() => disableMapping(rows.map(({ id }) => id))}
                        variant={"extended"}
                    >
                        {i18n.t("Disable mapping")}
                    </Fab>
                )}
            </React.Fragment>
        ),
        [classes, rows, disableMapping, resetMapping, isChildrenMapping]
    );

    const actions: TableAction<MetadataType>[] = useMemo(
        () => [
            {
                // Required to disable default "select" action
                name: "select",
                text: "Select",
                isActive: () => false,
            },
            {
                name: "set-mapping",
                text: i18n.t("Set mapping"),
                multiple: false,
                onClick: openMappingDialog,
                icon: <Icon>open_in_new</Icon>,
            },
            {
                name: "auto-mapping",
                text: i18n.t("Auto-map element"),
                // To make this action multiple, we need cancellable model "save" operation
                // Race conditions lead to unwanted bugs
                multiple: false,
                onClick: applyAutoMapping,
                icon: <Icon>compare_arrows</Icon>,
            },
            {
                name: "disable-mapping",
                text: i18n.t("Disable mapping"),
                multiple: true,
                onClick: disableMapping,
                icon: <Icon>sync_disabled</Icon>,
                isActive: () => type === "dataElements" || type === "organisationUnits",
            },
            {
                name: "reset-mapping",
                text: i18n.t("Reset mapping to default values"),
                multiple: true,
                onClick: resetMapping,
                icon: <Icon>clear</Icon>,
            },
            {
                name: "related-mapping",
                text: i18n.t("Related metadata mapping"),
                multiple: false,
                onClick: openRelatedMapping,
                icon: <Icon>assignment</Icon>,
            },
        ],
        [
            disableMapping,
            openMappingDialog,
            resetMapping,
            applyAutoMapping,
            openRelatedMapping,
            type,
        ]
    );

    const notifyNewModel = useCallback(model => {
        setLoading(true);
        setRows([]);
        setSelectedIds([]);
        setModel(() => model);
    }, []);

    const closeWarningDialog = () => setWarningDialog(null);
    const closeMappingDialog = () => setElementsToMap([]);
    const closeWizard = () => setRelatedMapping(undefined);

    return (
        <React.Fragment>
            {!!warningDialog && (
                <ConfirmationDialog
                    isOpen={true}
                    title={warningDialog.title}
                    description={warningDialog.description}
                    saveText={i18n.t("Ok")}
                    onSave={() => {
                        if (warningDialog.action) warningDialog.action();
                        setWarningDialog(null);
                    }}
                    onCancel={closeWarningDialog}
                />
            )}

            {elementsToMap.length > 0 && (
                <MappingDialog
                    rows={rows}
                    model={model}
                    elements={elementsToMap}
                    onUpdateMapping={updateMapping}
                    onClose={closeMappingDialog}
                    instance={instance}
                    mapping={mapping}
                    mappingPath={mappingPath}
                />
            )}

            {relatedMapping && (
                <MappingWizard
                    instance={instance}
                    updateMapping={onChangeMapping}
                    mappingPath={relatedMapping}
                    onCancel={closeWizard}
                />
            )}

            <MetadataTable
                models={models}
                filterRows={filterRows}
                additionalColumns={columns}
                additionalFilters={filters}
                additionalActions={actions}
                notifyNewModel={notifyNewModel}
                notifyRowsChange={setRows}
                loading={isLoading}
                selectedIds={selectedIds}
                notifyNewSelection={setSelectedIds}
            />
        </React.Fragment>
    );
}
