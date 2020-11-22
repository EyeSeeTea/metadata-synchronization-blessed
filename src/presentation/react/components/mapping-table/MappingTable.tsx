import { Icon, IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core";
import {
    ConfirmationDialog,
    RowConfig,
    TableAction,
    TableColumn,
    TableGlobalAction,
    useLoading,
    useSnackbar,
} from "d2-ui-components";
import _ from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { DataSource } from "../../../../domain/instance/entities/DataSource";
import { MappingConfig } from "../../../../domain/mapping/entities/MappingConfig";
import {
    MetadataMapping,
    MetadataMappingDictionary,
} from "../../../../domain/mapping/entities/MetadataMapping";
import { cleanOrgUnitPath } from "../../../../domain/synchronization/utils";
import i18n from "../../../../locales";
import { D2Model } from "../../../../models/dhis/default";
import { ProgramDataElementModel } from "../../../../models/dhis/mapping";
import { DataElementModel, OrganisationUnitModel } from "../../../../models/dhis/metadata";
import { MetadataType } from "../../../../utils/d2";
import { useAppContext } from "../../contexts/AppContext";
import MappingDialog, { MappingDialogConfig } from "../mapping-dialog/MappingDialog";
import MappingWizard, { MappingWizardConfig, prepareSteps } from "../mapping-wizard/MappingWizard";
import MetadataTable, { MetadataTableProps } from "../metadata-table/MetadataTable";
import { cleanNestedMappedId, EXCLUDED_KEY, getChildrenRows } from "./utils";

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

export interface MappingTableProps extends MetadataTableProps {
    originInstance?: DataSource;
    destinationInstance: DataSource;
    models: typeof D2Model[];
    filterRows?: string[];
    transformRows?: (rows: MetadataType[]) => MetadataType[];
    mapping: MetadataMappingDictionary;
    globalMapping: MetadataMappingDictionary;
    onChangeMapping(mapping: MetadataMappingDictionary): Promise<void>;
    onApplyGlobalMapping(type: string, id: string, mapping: MetadataMapping): Promise<void>;
    isChildrenMapping?: boolean;
    mappingPath?: string[];
}

export default function MappingTable({
    originInstance,
    destinationInstance,
    models,
    filterRows,
    transformRows,
    mapping,
    globalMapping,
    onChangeMapping,
    onApplyGlobalMapping,
    isChildrenMapping = false,
    mappingPath,
    ...rest
}: MappingTableProps) {
    const { compositionRoot } = useAppContext();
    const classes = useStyles();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [model, setModel] = useState<typeof D2Model>(() => models[0] ?? DataElementModel);

    const [rows, setRows] = useState<MetadataType[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [warningDialog, setWarningDialog] = useState<WarningDialog | null>(null);
    const [mappingConfig, setMappingConfig] = useState<MappingDialogConfig | null>(null);
    const [wizardConfig, setWizardConfig] = useState<MappingWizardConfig | null>(null);

    const getMappedItem = useCallback(
        (row?: MetadataType): MetadataMapping => {
            const mappingType = row?.model.getMappingType();
            if (!row || !mappingType) return {};

            const id = cleanNestedMappedId(row.id);
            const localItemMapping = _.get(mapping, [mappingType, row.id]);
            const globalItemMapping = _.get(globalMapping, [mappingType, id]);

            const isMapped = !!localItemMapping?.mappedId;
            const isDifferent = localItemMapping?.mappedId !== globalItemMapping?.mappedId;
            const itemMapping = isMapped && isDifferent ? localItemMapping : globalItemMapping;

            return itemMapping ?? {};
        },
        [mapping, globalMapping]
    );

    const applyMapping = useCallback(
        async (config: MappingConfig[]) => {
            try {
                const newMapping = await compositionRoot.mapping.apply(
                    originInstance ?? compositionRoot.localInstance,
                    destinationInstance,
                    mapping,
                    config,
                    isChildrenMapping
                );

                await onChangeMapping(newMapping);
                setSelectedIds([]);
            } catch (e) {
                console.error(e);
                snackbar.error(i18n.t("Could not apply mapping, please try again."));
            }
            loading.reset();
        },
        [
            compositionRoot,
            originInstance,
            destinationInstance,
            snackbar,
            loading,
            mapping,
            isChildrenMapping,
            onChangeMapping,
        ]
    );

    const makeMappingGlobal = useCallback(
        async (selection: string[]) => {
            const id = selection[0];
            const firstElement = _.find(rows, ["id", id]);
            const mappingType = firstElement?.model.getMappingType();
            const elementMapping = mappingType ? _.get(mapping, [mappingType, id]) : {};

            if (!firstElement || !mappingType || !elementMapping?.mappedId) {
                snackbar.error(i18n.t("You need to map the item before applying a global mapping"));
            } else {
                await applyMapping([
                    { selection, mappingType, global: false, mappedId: undefined },
                ]);
                await onApplyGlobalMapping(mappingType, cleanNestedMappedId(id), elementMapping);
                snackbar.success(i18n.t("Successfully applied global mapping"));
            }
        },
        [onApplyGlobalMapping, applyMapping, rows, mapping, snackbar]
    );

    const updateMapping = useCallback(
        async (selection: string[], mappedId?: string) => {
            const id = selection[0];
            const firstElement = _.find(rows, ["id", id]);
            const mappingType = firstElement?.model.getMappingType();
            const global = firstElement?.model.getIsGlobalMapping();
            if (!mappingType) {
                snackbar.error(i18n.t("Unable to update mapping"));
            } else {
                applyMapping([{ selection, mappingType, global, mappedId }]);
            }
        },
        [applyMapping, rows, snackbar]
    );

    const disableMapping = useCallback(
        async (selection: string[]) => {
            const id = selection[0];
            const firstElement = _.find(rows, ["id", id]);
            const mappingType = firstElement?.model.getMappingType();
            const global = firstElement?.model.getIsGlobalMapping();
            if (selection.length > 0 && mappingType) {
                setWarningDialog({
                    title: i18n.t("Exclude mapping"),
                    description: i18n.t(
                        "Are you sure you want to exclude mapping for {{total}} elements?",
                        {
                            total: selection.length,
                        }
                    ),
                    action: () => {
                        applyMapping([{ selection, mappingType, global, mappedId: EXCLUDED_KEY }]);
                    },
                });
            } else {
                snackbar.error(i18n.t("Please select at least one item to exclude mapping"));
            }
        },
        [snackbar, applyMapping, rows]
    );

    const resetMapping = useCallback(
        async (selection: string[]) => {
            const id = selection[0];
            const firstElement = _.find(rows, ["id", id]);
            const mappingType = firstElement?.model.getMappingType();
            const global = firstElement?.model.getIsGlobalMapping();
            if (selection.length > 0 && mappingType) {
                setWarningDialog({
                    title: i18n.t("Reset mapping"),
                    description: i18n.t(
                        "Are you sure you want to reset mapping for {{total}} elements?",
                        {
                            total: selection.length,
                        }
                    ),
                    action: () => {
                        applyMapping([{ selection, mappingType, global, mappedId: undefined }]);
                    },
                });
            } else {
                snackbar.error(i18n.t("Please select at least one item to reset mapping"));
            }
        },
        [snackbar, applyMapping, rows]
    );

    const applyAutoMapping = useCallback(
        async (elements: string[]) => {
            const types = _(rows)
                .filter(({ id }) => elements.includes(id))
                .map(row => row.model.getMappingType())
                .uniq()
                .compact()
                .value();

            const id = elements[0];
            const firstElement = _.find(rows, ["id", id]);
            const global = firstElement?.model.getIsGlobalMapping();

            if (types.length === 0) {
                snackbar.error(i18n.t("You need to select at least one valid item"));
            } else if (types.length > 1) {
                snackbar.error(i18n.t("You need to select all items from the same type"));
            }

            try {
                loading.show(
                    true,
                    i18n.t("Preparing auto-mapping for {{total}} elements", {
                        total: elements.length,
                    })
                );

                const { tasks, errors } = await compositionRoot.mapping.autoMap(
                    originInstance ?? compositionRoot.localInstance,
                    destinationInstance,
                    mapping,
                    types[0],
                    elements,
                    global
                );

                await applyMapping(tasks);

                if (errors.length > 0) {
                    snackbar.error(
                        errors
                            .map(id =>
                                i18n.t(
                                    "Could not find a suitable candidate to apply auto-mapping for {{id}}",
                                    { id }
                                )
                            )
                            .join("\n")
                    );
                } else if (elements.length === 1) {
                    const firstElement = _.find(rows, ["id", elements[0]]);
                    const mappingType = firstElement?.model.getMappingType();
                    if (firstElement && mappingType) {
                        setMappingConfig({
                            elements,
                            mappingPath,
                            mappingType,
                            firstElement,
                        });
                    }
                }
            } catch (e) {
                console.error(e);
                snackbar.error(i18n.t("Could not connect with remote instance"));
            }
            loading.reset();
        },
        [
            compositionRoot,
            destinationInstance,
            originInstance,
            loading,
            applyMapping,
            rows,
            snackbar,
            mappingPath,
            mapping,
        ]
    );

    const openMappingDialog = useCallback(
        (elements: string[]) => {
            const firstElement = _.find(rows, ["id", elements[0]]);
            const types = _(rows)
                .filter(({ id }) => elements.includes(id))
                .map(row => row.model.getMappingType())
                .uniq()
                .value();

            if (types.length === 1) {
                setMappingConfig({ elements, mappingPath, mappingType: types[0], firstElement });
                setSelectedIds([]);
            } else if (types.length > 1) {
                snackbar.error(i18n.t("You need to select all items from the same type"));
            } else {
                snackbar.error(i18n.t("You need to select at least one valid item"));
            }
        },
        [mappingPath, rows, snackbar]
    );

    const createValidations = useCallback(
        async (dict: MetadataMappingDictionary) => {
            const result = _.cloneDeep(dict);

            for (const type of _.keys(dict)) {
                for (const id of _.keys(dict[type])) {
                    const { mappedId, mapping = {}, ...rest } = dict[type][id];
                    const innerMapping = await createValidations(mapping);

                    const {
                        mappedName,
                        mappedCode,
                        mappedLevel,
                    } = await compositionRoot.mapping.buildMapping({
                        originInstance: originInstance ?? compositionRoot.localInstance,
                        destinationInstance,
                        originalId: id,
                        mappedId,
                    });

                    result[type][id] = _.omitBy(
                        {
                            ...rest,
                            mappedId,
                            mappedName,
                            mappedCode,
                            mappedLevel,
                            mapping: innerMapping,
                        },
                        _.isUndefined
                    );
                }
            }

            return result;
        },
        [compositionRoot, destinationInstance, originInstance]
    );

    const applyValidateMapping = useCallback(
        async (selection: string[]) => {
            loading.show(
                true,
                i18n.t("Validating mapping for {{total}} elements", { total: selection.length })
            );

            const tasks = [];
            const selectedRows = _.compact(selection.map(id => _.find(rows, ["id", id])));
            const allRows = [...selectedRows, ...getChildrenRows(selectedRows, model)];

            for (const row of allRows) {
                const mappingType = row.model.getMappingType();
                const global = row.model.getIsGlobalMapping();
                if (mappingType) {
                    const newMapping = await createValidations({
                        [mappingType]: {
                            [row.id]: getMappedItem(row),
                        },
                    });
                    const { mappedId, ...overrides } = newMapping[mappingType][row.id];
                    tasks.push({ selection: [row.id], mappingType, global, mappedId, overrides });
                }
            }

            applyMapping(tasks);
            loading.reset();
        },
        [applyMapping, getMappedItem, loading, rows, createValidations, model]
    );

    const validateMapping = useCallback(
        async (selection: string[]) => {
            if (selection.length > 0) {
                setWarningDialog({
                    title: i18n.t("Validate mapping"),
                    description: i18n.t(
                        "Are you sure you want to validate mapping for {{total}} elements?",
                        {
                            total: selection.length,
                        }
                    ),
                    action: () => applyValidateMapping(selection),
                });
            } else {
                snackbar.error(i18n.t("Please select at least one item to validate mapping"));
            }
        },
        [snackbar, applyValidateMapping]
    );

    const openRelatedMapping = useCallback(
        (selection: string[]) => {
            const id = _.first(selection);
            const element = _.find(rows, ["id", id]);
            if (!id || !element) return;

            const mappingType = element.model.getMappingType();
            const { mapping: rowMapping = undefined } = mappingType
                ? _.get(mapping, [mappingType, id])
                : {};

            if (!rowMapping || !mappingType) {
                snackbar.error(
                    i18n.t(
                        "You need to map this element before accessing its related metadata mapping"
                    )
                );
            } else {
                setWizardConfig({ mappingPath: [mappingType, id], type: mappingType, element });
            }
        },
        [mapping, rows, snackbar]
    );

    const updateSelection = (selection: string[]) => {
        setSelectedIds(prevSelection => {
            const removedRows = _(prevSelection)
                .difference(selection)
                .map(id => _.find(rows, ["id", id]))
                .compact()
                .value();
            const childrenRemovals = getChildrenRows(removedRows, model).map(({ id }) => id);

            return _.difference(selection, childrenRemovals);
        });
    };

    const rowConfig = useCallback(
        (row: MetadataType): RowConfig => {
            const mappingType = row.model.getMappingType();

            if (!mappingType) {
                return { selectable: false };
            } else if (mappingType === ProgramDataElementModel.getMappingType()) {
                const parentId = _.first(row.id.split("-")) ?? row.id;
                const parentMapping = _.get(mapping, ["eventPrograms", parentId, "mappedId"]);
                const isParentMapped = !!parentMapping && parentMapping !== EXCLUDED_KEY;
                const { mappedId } = getMappedItem(row);

                const hasErrors = isParentMapped && !mappedId;
                return {
                    style: hasErrors ? { backgroundColor: "#ffcdd2" } : undefined,
                };
            } else {
                return {};
            }
        },
        [getMappedItem, mapping]
    );

    const columns: TableColumn<MetadataType>[] = useMemo(
        () =>
            _.compact([
                { name: "lastUpdated", text: i18n.t("Last updated"), sortable: true, hidden: true },
                {
                    name: "id",
                    text: i18n.t("ID"),
                    getValue: (row: MetadataType) => {
                        return cleanNestedMappedId(row.id);
                    },
                },
                {
                    name: "metadata-type",
                    text: i18n.t("Metadata type"),
                    hidden: model.getChildrenKeys() === undefined,
                    getValue: (row: MetadataType) => {
                        return row.model.getModelName();
                    },
                },
                {
                    name: "mapped-id",
                    text: i18n.t("Mapped ID"),
                    sortable: false,
                    getValue: (row: MetadataType) => {
                        const { mappedId } = getMappedItem(row);
                        const mappingType = row.model.getMappingType();
                        const text =
                            !!mappedId && mappedId !== EXCLUDED_KEY
                                ? cleanOrgUnitPath(mappedId)
                                : "-";

                        return (
                            <span>
                                <Typography variant={"inherit"} gutterBottom>
                                    {text}
                                </Typography>
                                {!!mappingType && (
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
                                )}
                            </span>
                        );
                    },
                },
                {
                    name: "mapped-name",
                    text: i18n.t("Mapped Name"),
                    sortable: false,
                    getValue: (row: MetadataType) => {
                        const {
                            mappedName,
                            conflicts = false,
                            mapping: childrenMapping,
                        } = getMappedItem(row);

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
                                                if (!isChildrenMapping)
                                                    openRelatedMapping([row.id]);
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
                model === OrganisationUnitModel
                    ? {
                          name: "mapped-level",
                          text: i18n.t("Mapped Level"),
                          sortable: false,
                          getValue: (row: MetadataType) => {
                              const { mappedLevel } = getMappedItem(row);

                              return (
                                  <span>
                                      <Typography variant={"inherit"} gutterBottom>
                                          {mappedLevel ?? "-"}
                                      </Typography>
                                  </span>
                              );
                          },
                      }
                    : undefined,
                {
                    name: "mapping-status",
                    text: i18n.t("Mapping Status"),
                    sortable: false,
                    getValue: (row: MetadataType) => {
                        const { mappedId, global = false } = getMappedItem(row);

                        const notMappedStatus = !mappedId ? i18n.t("Not mapped") : undefined;
                        const disabledStatus =
                            mappedId === EXCLUDED_KEY ? i18n.t("Excluded") : undefined;
                        const globalStatus = global ? i18n.t("Mapped (Global)") : i18n.t("Mapped");

                        return (
                            <span>
                                <Typography variant={"inherit"} gutterBottom>
                                    {notMappedStatus ?? disabledStatus ?? globalStatus}
                                </Typography>
                            </span>
                        );
                    },
                },
            ]),
        [classes, model, openMappingDialog, isChildrenMapping, openRelatedMapping, getMappedItem]
    );

    const addToSelection = useCallback(
        (selection: string[]) => {
            const ids = _(selection)
                .map(id => _.find(rows, ["id", id]))
                .compact()
                .filter(row => !!row.model.getMappingType())
                .map(({ id }) => id)
                .value();

            setSelectedIds(prevSelection => {
                const oldSelection = _.difference(prevSelection, ids);
                const newSelection = _.difference(ids, prevSelection);
                return _.uniq([...oldSelection, ...newSelection]);
            });
        },
        [rows]
    );

    const actions: TableAction<MetadataType>[] = useMemo(
        () => [
            {
                name: "select",
                text: "Select",
                onClick: addToSelection,
                isActive: () => false,
                primary: true,
            },
            {
                name: "set-mapping",
                text: i18n.t("Set mapping"),
                multiple: true,
                onClick: openMappingDialog,
                icon: <Icon>open_in_new</Icon>,
                isActive: (selected: MetadataType[]) => {
                    return _.every(selected, row => row.model.getMappingType());
                },
            },
            {
                name: "select-children-rows",
                text: i18n.t("Select children"),
                multiple: true,
                onClick: (selection: string[]) => {
                    const selectedRows = _.compact(selection.map(id => _.find(rows, ["id", id])));
                    const children = getChildrenRows(selectedRows, model).map(({ id }) => id);
                    setSelectedIds(prevSelection => _.uniq([...prevSelection, ...children]));
                },
                icon: <Icon>done_all</Icon>,
                isActive: (selection: MetadataType[]) => {
                    const children = getChildrenRows(selection, model);
                    return children.length > 0;
                },
            },
            {
                name: "global-mapping",
                text: i18n.t("Make this mapping global"),
                multiple: false,
                onClick: makeMappingGlobal,
                icon: <Icon>add_circle_outline</Icon>,
                isActive: (selected: MetadataType[]) => {
                    const isRowMappedAndNotGlobal = _(selected)
                        .map(getMappedItem)
                        .every(({ mappedId, global }) => !!mappedId && !global);
                    const isRowCompatible =
                        isChildrenMapping ||
                        _.every(selected, row => row.model.getIsGlobalMapping());

                    return isRowMappedAndNotGlobal && isRowCompatible;
                },
            },
            {
                name: "validate-mapping",
                text: i18n.t("Validate mapping"),
                multiple: true,
                onClick: validateMapping,
                icon: <Icon>find_replace</Icon>,
                isActive: (selected: MetadataType[]) => {
                    const isGlobalMapping = _.some(selected, row => row.model.getIsGlobalMapping());
                    return _(selected)
                        .map(getMappedItem)
                        .some(({ mappedId, global }) => !!mappedId && (isGlobalMapping || !global));
                },
            },
            {
                name: "auto-mapping",
                text: i18n.t("Auto-map element"),
                multiple: true,
                onClick: applyAutoMapping,
                icon: <Icon>compare_arrows</Icon>,
                isActive: (selected: MetadataType[]) => {
                    return _.every(selected, row => row.model.getMappingType());
                },
            },
            {
                name: "disable-mapping",
                text: i18n.t("Exclude mapping"),
                multiple: true,
                onClick: disableMapping,
                icon: <Icon>sync_disabled</Icon>,
                isActive: (selected: MetadataType[]) => {
                    return _.every(selected, row => row.model.getMappingType());
                },
            },
            {
                name: "reset-mapping",
                text: i18n.t("Reset mapping to default values"),
                multiple: true,
                onClick: resetMapping,
                icon: <Icon>clear</Icon>,
                isActive: (selected: MetadataType[]) => {
                    return _.every(selected, row => row.model.getMappingType());
                },
            },
            {
                name: "related-mapping",
                text: i18n.t("Related metadata mapping"),
                multiple: false,
                onClick: openRelatedMapping,
                icon: <Icon>assignment</Icon>,
                isActive: (selected: MetadataType[]) => {
                    const element = selected[0];
                    const mappingType = element.model.getMappingType();
                    const steps = prepareSteps(mappingType, element);
                    const { mappedId } = getMappedItem(element);

                    return !!mappedId && !isChildrenMapping && steps.length > 0;
                },
            },
        ],
        [
            addToSelection,
            disableMapping,
            openMappingDialog,
            resetMapping,
            applyAutoMapping,
            makeMappingGlobal,
            validateMapping,
            openRelatedMapping,
            getMappedItem,
            isChildrenMapping,
            model,
            rows,
        ]
    );

    const globalActions: TableGlobalAction[] = _.compact([
        model !== OrganisationUnitModel
            ? {
                  name: "validate-mapping",
                  text: i18n.t("Validate mapping"),
                  onClick: validateMapping,
                  icon: <Icon>find_replace</Icon>,
              }
            : undefined,
        model !== OrganisationUnitModel
            ? {
                  name: "reset-mapping",
                  text: i18n.t("Reset mapping"),
                  onClick: resetMapping,
                  icon: <Icon>clear</Icon>,
              }
            : undefined,
        model !== OrganisationUnitModel
            ? {
                  name: "disable-mapping",
                  text: i18n.t("Exclude mapping"),
                  onClick: disableMapping,
                  icon: <Icon>sync_disabled</Icon>,
              }
            : undefined,
    ]);

    const notifyNewModel = useCallback(model => {
        setRows([]);
        setSelectedIds([]);
        setModel(() => model);
    }, []);

    const updateRows = useCallback(
        (rows: MetadataType[]) => {
            setRows([...rows, ...getChildrenRows(rows, model)]);
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
                    instance={destinationInstance}
                    config={mappingConfig}
                    mapping={mapping}
                    onUpdateMapping={updateMapping}
                    onClose={closeMappingDialog}
                />
            )}

            {!!wizardConfig && (
                <MappingWizard
                    originInstance={originInstance}
                    destinationInstance={destinationInstance}
                    config={wizardConfig}
                    mapping={mapping}
                    onUpdateMapping={onChangeMapping}
                    onApplyGlobalMapping={onApplyGlobalMapping}
                    onCancel={closeWizard}
                />
            )}

            <MetadataTable
                remoteInstance={originInstance}
                models={models}
                filterRows={filterRows}
                transformRows={transformRows}
                additionalColumns={columns}
                additionalActions={actions}
                notifyNewModel={notifyNewModel}
                notifyRowsChange={updateRows}
                selectedIds={selectedIds}
                notifyNewSelection={updateSelection}
                globalActions={globalActions}
                childrenKeys={!isChildrenMapping ? model.getChildrenKeys() : undefined}
                rowConfig={rowConfig}
                {...rest}
            />
        </React.Fragment>
    );
}
