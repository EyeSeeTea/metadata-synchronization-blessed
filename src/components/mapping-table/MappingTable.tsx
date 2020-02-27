import i18n from "@dhis2/d2-i18n";
import { Icon, IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core";
import { useD2, useD2Api } from "d2-api";
import {
    ConfirmationDialog,
    TableAction,
    TableColumn,
    TableGlobalAction,
    useLoading,
    useSnackbar,
} from "d2-ui-components";
import _ from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import MappingDialog, { MappingDialogConfig } from "../../components/mapping-dialog/MappingDialog";
import MappingWizard from "../../components/mapping-wizard/MappingWizard";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import { D2Model, DataElementModel } from "../../models/d2Model";
import { d2ModelFactory } from "../../models/d2ModelFactory";
import Instance, { MetadataMapping, MetadataMappingDictionary } from "../../models/instance";
import { D2 } from "../../types/d2";
import { MetadataType } from "../../utils/d2";
import { cleanOrgUnitPath } from "../../utils/synchronization";
import { autoMap, buildMapping, getMetadataTypeFromRow } from "./utils";

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
    const d2 = useD2() as D2;
    const classes = useStyles();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [model, setModel] = useState<typeof D2Model>(() => models[0] ?? DataElementModel);
    const type = model.getCollectionName();
    const instanceApi = instance.getApi();

    const [isLoading, setLoading] = useState<boolean>(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [warningDialog, setWarningDialog] = useState<WarningDialog | null>(null);
    const [mappingConfig, setMappingConfig] = useState<MappingDialogConfig | null>(null);
    const [rows, setRows] = useState<MetadataType[]>([]);

    const [relatedMapping, setRelatedMapping] = useState<string[]>();

    const applyMapping = useCallback(
        async (selection: string[], mappedId: string | undefined) => {
            loading.show(true, i18n.t("Applying mapping update"));
            try {
                const newMapping = _.cloneDeep(mapping);
                for (const id of selection) {
                    const row = _.find(rows, ["id", id]);
                    const rowType = row?.__mappingType__ ?? type;
                    const model = d2ModelFactory(api, rowType);
                    _.unset(newMapping, [rowType, id]);
                    if (isChildrenMapping || mappedId) {
                        const mapping = await buildMapping(
                            api,
                            instanceApi,
                            model,
                            row?.__originalId__ ?? id,
                            mappedId
                        );
                        _.set(newMapping, [rowType, id], mapping);
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
            mapping,
            isChildrenMapping,
            onChangeMapping,
            rows,
        ]
    );

    const updateMapping = useCallback(
        async (elementsToMap: string[], mappedId?: string) => {
            applyMapping(elementsToMap, mappedId);
        },
        [applyMapping]
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
        async (elements: string[]) => {
            const selectedItem = _.find(rows, ["id", elements[0]]);

            if (elements.length !== 1) {
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
                const type = getMetadataTypeFromRow(selectedItem);
                await applyMapping(elements, candidate);
                setMappingConfig({ elements, mappingPath, type });
            }
        },
        [applyMapping, instanceApi, rows, snackbar, model, mappingPath]
    );

    const openMappingDialog = useCallback(
        (elements: string[]) => {
            const types = _(rows)
                .filter(({ id }) => elements.includes(id))
                .map(e => getMetadataTypeFromRow(e))
                .uniq()
                .value();

            if (types.length === 1) {
                setMappingConfig({ elements, mappingPath, type: types[0] });
                setSelectedIds([]);
            } else if (types.length > 1) {
                snackbar.error(i18n.t("You need to select all items from the same type"));
            } else {
                snackbar.error(i18n.t("You need to select at least one valid item"));
            }
        },
        [mappingPath, rows, snackbar]
    );

    const openRelatedMapping = useCallback(
        (selection: string[]) => {
            const id = _.first(selection);
            const row = _.find(rows, ["id", id]);
            if (!id || !row) return;

            const rowType = getMetadataTypeFromRow(row);
            const { mapping: rowMapping } = mapping[rowType][id] ?? {};

            if (!rowMapping) {
                snackbar.error(
                    i18n.t(
                        "You need to map this element before accessing its related metadata mapping"
                    )
                );
            } else {
                setRelatedMapping([rowType, id]);
            }
        },
        [mapping, rows, snackbar]
    );

    const columns: TableColumn<MetadataType>[] = useMemo(
        () => [
            {
                name: "id",
                text: "ID",
                getValue: (row: MetadataType) => {
                    return _.last(row.id?.split("-")) ?? row.id;
                },
            },
            {
                name: "metadata-type",
                text: "Metadata type",
                hidden: model.getChildrenKeys() === undefined,
                getValue: (row: MetadataType) => {
                    return d2.models[row.__type__]?.displayName ?? type;
                },
            },
            {
                name: "mapped-id",
                text: "Mapped ID",
                sortable: false,
                getValue: (row: MetadataType) => {
                    const mappedId = _.get(
                        mapping,
                        [row.__mappingType__ ?? type, row.id, "mappedId"],
                        row.id
                    );
                    const cleanId = _.last(cleanOrgUnitPath(mappedId)?.split("-")) ?? row.id;
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
                sortable: false,
                getValue: (row: MetadataType) => {
                    const type = getMetadataTypeFromRow(row);
                    const {
                        mappedId = row.id,
                        mappedName = mappedId === "DISABLED" ? undefined : i18n.t("Not mapped"),
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
                                {mappedName ?? "-"}
                            </Typography>
                            {showConflicts && (
                                <Tooltip title={i18n.t("Mapping has errors")} placement="top">
                                    <IconButton
                                        className={classes.iconButton}
                                        onClick={event => {
                                            event.stopPropagation();
                                            if (!isChildrenMapping) openRelatedMapping([row.id]);
                                            else openMappingDialog([row.id]);
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
        [
            d2,
            classes,
            model,
            type,
            mapping,
            openMappingDialog,
            isChildrenMapping,
            openRelatedMapping,
        ]
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
                multiple: true,
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
                isActive: () => !isChildrenMapping,
            },
        ],
        [
            disableMapping,
            openMappingDialog,
            resetMapping,
            applyAutoMapping,
            openRelatedMapping,
            isChildrenMapping,
        ]
    );

    const globalActions: TableGlobalAction[] = [
        {
            name: "reset-mapping",
            text: i18n.t("Reset mapping"),
            onClick: resetMapping,
            icon: <Icon>clear</Icon>,
        },
        {
            name: "disable-mapping",
            text: i18n.t("Disable mapping"),
            onClick: disableMapping,
            icon: <Icon>sync_disabled</Icon>,
        },
    ];

    const notifyNewModel = useCallback(model => {
        setLoading(true);
        setRows([]);
        setSelectedIds([]);
        setModel(() => model);
    }, []);

    const updateRows = useCallback(
        (rows: MetadataType[]) => {
            const childrenRows = (_(rows)
                .map(row =>
                    _(row)
                        .pick(model.getChildrenKeys() ?? [])
                        .values()
                        .flatten()
                        .value()
                )
                .flatten()
                .value() as unknown) as MetadataType[];

            setRows([...rows, ...childrenRows]);
        },
        [model]
    );

    const closeWarningDialog = () => setWarningDialog(null);
    const closeMappingDialog = () => setMappingConfig(null);
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

            {!!mappingConfig && (
                <MappingDialog
                    instance={instance}
                    config={mappingConfig}
                    mapping={mapping}
                    onUpdateMapping={updateMapping}
                    onClose={closeMappingDialog}
                />
            )}

            {!!relatedMapping && (
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
                additionalActions={actions}
                notifyNewModel={notifyNewModel}
                notifyRowsChange={updateRows}
                loading={isLoading}
                selectedIds={selectedIds}
                notifyNewSelection={setSelectedIds}
                globalActions={globalActions}
                childrenKeys={!isChildrenMapping ? model.getChildrenKeys() : undefined}
            />
        </React.Fragment>
    );
}
