import i18n from "@dhis2/d2-i18n";
import { Icon, IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core";
import { useD2, useD2Api } from "d2-api";
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
import MappingDialog, { MappingDialogConfig } from "../../components/mapping-dialog/MappingDialog";
import MappingWizard, {
    MappingWizardConfig,
    prepareSteps,
} from "../../components/mapping-wizard/MappingWizard";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import { D2Model } from "../../models/dhis/default";
import { d2ModelFactory } from "../../models/dhis/factory";
import { ProgramDataElementModel } from "../../models/dhis/mapping";
import { DataElementModel, OrganisationUnitModel } from "../../models/dhis/metadata";
import Instance, { MetadataMapping, MetadataMappingDictionary } from "../../models/instance";
import { D2 } from "../../types/d2";
import { MetadataType } from "../../utils/d2";
import { cleanOrgUnitPath } from "../../utils/synchronization";
import {
    autoMap,
    buildDataElementFilterForProgram,
    buildMapping,
    cleanNestedMappedId,
    EXCLUDED_KEY,
    getChildrenRows,
} from "./utils";

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
    overrides?: MetadataMapping;
}

export interface MappingTableProps {
    instance: Instance;
    models: typeof D2Model[];
    filterRows?: string[];
    mapping: MetadataMappingDictionary;
    globalMapping: MetadataMappingDictionary;
    onChangeMapping(mapping: MetadataMappingDictionary): Promise<void>;
    onApplyGlobalMapping(type: string, id: string, mapping: MetadataMapping): Promise<void>;
    isChildrenMapping?: boolean;
    mappingPath?: string[];
}

export default function MappingTable({
    instance,
    models,
    filterRows,
    mapping,
    globalMapping,
    onChangeMapping,
    onApplyGlobalMapping,
    isChildrenMapping = false,
    mappingPath,
}: MappingTableProps) {
    const api = useD2Api();
    const d2 = useD2() as D2;
    const classes = useStyles();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const instanceApi = instance.getApi();
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
                const newMapping = _.cloneDeep(mapping);
                for (const { selection, mappedId, overrides = {} } of config) {
                    for (const id of selection) {
                        const row = _.find(rows, ["id", id]);
                        const name = row?.name ?? cleanNestedMappedId(id);
                        loading.show(
                            true,
                            i18n.t("Applying mapping update for element {{name}}", { name })
                        );
                        const mappingType = row?.model.getMappingType();
                        if (!row || !mappingType) {
                            throw new Error("Attempting to apply mapping without a valid type");
                        }

                        const destinationModel = d2ModelFactory(api, mappingType);
                        _.unset(newMapping, [mappingType, id]);
                        if (isChildrenMapping || mappedId) {
                            const mapping = await buildMapping({
                                api,
                                instanceApi,
                                originModel: row.model,
                                destinationModel,
                                originalId: _.last(id.split("-")) ?? id,
                                mappedId,
                            });
                            _.set(newMapping, [mappingType, id], {
                                ...mapping,
                                global: row.model.getIsGlobalMapping(),
                                ...overrides,
                            });
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
        [api, instanceApi, snackbar, loading, mapping, isChildrenMapping, onChangeMapping, rows]
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
                await applyMapping([{ selection, mappedId: undefined }]);
                await onApplyGlobalMapping(mappingType, cleanNestedMappedId(id), elementMapping);
                snackbar.success(i18n.t("Successfully applied global mapping"));
            }
        },
        [onApplyGlobalMapping, applyMapping, rows, mapping, snackbar]
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
                    title: i18n.t("Exclude mapping"),
                    description: i18n.t(
                        "Are you sure you want to exclude mapping for {{total}} elements?",
                        {
                            total: selection.length,
                        }
                    ),
                    action: () => applyMapping([{ selection, mappedId: EXCLUDED_KEY }]),
                });
            } else {
                snackbar.error(i18n.t("Please select at least one item to exclude mapping"));
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

                const tasks: MappingConfig[] = [];
                const errors: string[] = [];

                for (const id of elements) {
                    const row = _.find(rows, ["id", id]);
                    if (row) {
                        const filter = await buildDataElementFilterForProgram(
                            instanceApi,
                            id,
                            mapping
                        );

                        const mappingType = row?.model.getMappingType();
                        const destinationModel = d2ModelFactory(api, mappingType);
                        const candidates = await autoMap({
                            api,
                            instanceApi,
                            originModel: row.model,
                            destinationModel,
                            selectedItemId: id,
                            filter,
                        });
                        const { mappedId } = _.first(candidates) ?? {};

                        if (!mappedId) {
                            errors.push(
                                i18n.t(
                                    "Could not find a suitable candidate to apply auto-mapping for {{id}}",
                                    { id: cleanNestedMappedId(id) }
                                )
                            );
                        } else {
                            tasks.push({ selection: [id], mappedId });
                        }
                    }
                }

                await applyMapping(tasks);

                if (errors.length > 0) {
                    snackbar.error(errors.join("\n"));
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
        [api, loading, applyMapping, instanceApi, rows, snackbar, mappingPath, mapping]
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
                    const row = _.find(rows, ["id", id]);
                    const rowType = row?.model.getCollectionName() ?? type;
                    const mappingType = row?.model.getMappingType() ?? type;
                    const originModel = d2ModelFactory(api, rowType) ?? model;
                    const destinationModel = d2ModelFactory(api, mappingType);
                    const innerMapping = await createValidations(mapping);
                    const { mappedName, mappedCode, mappedLevel } = await buildMapping({
                        api,
                        instanceApi,
                        originModel,
                        destinationModel,
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
        [api, instanceApi, model, rows]
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
                if (mappingType) {
                    const newMapping = await createValidations({
                        [mappingType]: {
                            [row.id]: getMappedItem(row),
                        },
                    });
                    const { mappedId, ...overrides } = newMapping[mappingType][row.id];
                    tasks.push({ selection: [row.id], mappedId, overrides });
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
                        return row.model.getModelName(d2);
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
        [
            d2,
            classes,
            model,
            openMappingDialog,
            isChildrenMapping,
            openRelatedMapping,
            getMappedItem,
        ]
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
                    onApplyGlobalMapping={onApplyGlobalMapping}
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
                selectedIds={selectedIds}
                notifyNewSelection={updateSelection}
                globalActions={globalActions}
                childrenKeys={!isChildrenMapping ? model.getChildrenKeys() : undefined}
                rowConfig={rowConfig}
            />
        </React.Fragment>
    );
}
