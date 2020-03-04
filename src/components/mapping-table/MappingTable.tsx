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
import MappingWizard, { MappingWizardConfig } from "../../components/mapping-wizard/MappingWizard";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import { D2Model, DataElementModel } from "../../models/d2Model";
import { d2ModelFactory } from "../../models/d2ModelFactory";
import Instance, { MetadataMapping, MetadataMappingDictionary } from "../../models/instance";
import { D2 } from "../../types/d2";
import { MetadataType } from "../../utils/d2";
import { cleanOrgUnitPath } from "../../utils/synchronization";
import { autoMap, buildMapping, cleanNestedMappedId, getMetadataTypeFromRow } from "./utils";

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

interface MappingConfig {
    selection: string[];
    mappedId: string | undefined;
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
    const [wizardConfig, setWizardConfig] = useState<MappingWizardConfig | null>(null);
    const [rows, setRows] = useState<MetadataType[]>([]);

    const applyMapping = useCallback(
        async (config: MappingConfig[]) => {
            try {
                const newMapping = _.cloneDeep(mapping);
                for (const { selection, mappedId } of config) {
                    for (const id of selection) {
                        const row = _.find(rows, ["id", id]);
                        loading.show(
                            true,
                            i18n.t("Applying mapping update for element {{id}}", { id })
                        );
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
                }

                await onChangeMapping(newMapping);
                setSelectedIds([]);
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
        async (selection: string[], mappedId?: string) => {
            applyMapping([{ selection, mappedId }]);
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
                    action: () => applyMapping([{ selection, mappedId: "DISABLED" }]),
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
                    action: () => applyMapping([{ selection, mappedId: undefined }]),
                });
            } else {
                snackbar.error(i18n.t("Please select at least one item to reset mapping"));
            }
        },
        [snackbar, applyMapping]
    );

    const applyAutoMapping = useCallback(
        async (elements: string[]) => {
            try {
                loading.show(
                    true,
                    i18n.t("Preparing auto-mapping for {{total}} elements", {
                        total: elements.length,
                    })
                );
                const tasks = [];
                for (const id of elements) {
                    const element = _.find(rows, ["id", id]);
                    const elementType = element?.__type__ ?? type;

                    const model = d2ModelFactory(instanceApi, elementType);
                    const candidates = await autoMap(api, instanceApi, model, id);
                    const { mappedId } = _.first(candidates) ?? {};

                    if (!mappedId) {
                        snackbar.error(
                            i18n.t("Could not find a suitable candidate to apply auto-mapping")
                        );
                    } else {
                        tasks.push({ selection: [id], mappedId });
                    }
                }

                await applyMapping(tasks);

                if (elements.length === 1) {
                    const firstElement = _.find(rows, ["id", elements[0]]);
                    if (firstElement) {
                        const type = getMetadataTypeFromRow(firstElement);
                        setMappingConfig({ elements, mappingPath, type, firstElement });
                    }
                }
                loading.reset();
            } catch (e) {
                snackbar.error(i18n.t("Could not connect with remote instance"));
            }
        },
        [api, type, loading, applyMapping, instanceApi, rows, snackbar, mappingPath]
    );

    const openMappingDialog = useCallback(
        (elements: string[]) => {
            const firstElement = _.find(rows, ["id", elements[0]]);
            const types = _(rows)
                .filter(({ id }) => elements.includes(id))
                .map(e => getMetadataTypeFromRow(e))
                .uniq()
                .value();

            if (types.length === 1) {
                setMappingConfig({ elements, mappingPath, type: types[0], firstElement });
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
            const element = _.find(rows, ["id", id]);
            if (!id || !element) return;

            const type = getMetadataTypeFromRow(element);
            const { mapping: rowMapping } = mapping[type][id] ?? {};

            if (!rowMapping) {
                snackbar.error(
                    i18n.t(
                        "You need to map this element before accessing its related metadata mapping"
                    )
                );
            } else {
                setWizardConfig({ mappingPath: [type, id], type, element });
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
                    return cleanNestedMappedId(row.id);
                },
            },
            {
                name: "metadata-type",
                text: "Metadata type",
                hidden: model.getChildrenKeys() === undefined,
                getValue: (row: MetadataType) => {
                    return d2.models[row.__type__]?.displayName;
                },
            },
            {
                name: "mapped-id",
                text: "Mapped ID",
                sortable: false,
                getValue: (row: MetadataType) => {
                    const type = getMetadataTypeFromRow(row);
                    const mappedId = _.get(mapping, [type, row.id, "mappedId"], row.id);
                    const cleanId = cleanNestedMappedId(cleanOrgUnitPath(mappedId));
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
        [d2, classes, model, mapping, openMappingDialog, isChildrenMapping, openRelatedMapping]
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
                multiple: true,
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
                isActive: () => !isChildrenMapping && type !== "organisationUnits",
            },
        ],
        [
            disableMapping,
            openMappingDialog,
            resetMapping,
            applyAutoMapping,
            openRelatedMapping,
            isChildrenMapping,
            type,
        ]
    );

    const globalActions: TableGlobalAction[] = _.compact([
        type !== "organisationUnits"
            ? {
                  name: "reset-mapping",
                  text: i18n.t("Reset mapping"),
                  onClick: resetMapping,
                  icon: <Icon>clear</Icon>,
              }
            : undefined,
        type !== "organisationUnits"
            ? {
                  name: "disable-mapping",
                  text: i18n.t("Disable mapping"),
                  onClick: disableMapping,
                  icon: <Icon>sync_disabled</Icon>,
              }
            : undefined,
    ]);

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
    const closeWizard = () => setWizardConfig(null);

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

            {!!wizardConfig && (
                <MappingWizard
                    instance={instance}
                    config={wizardConfig}
                    updateMapping={onChangeMapping}
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
