import i18n from "@dhis2/d2-i18n";
import { Fab, Icon, IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core";
import { D2ModelSchemas, useD2, useD2Api } from "d2-api";
import {
    ConfirmationDialog,
    TableAction,
    TableColumn,
    TableSelection,
    useLoading,
    useSnackbar,
} from "d2-ui-components";
import _ from "lodash";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Dropdown from "../../components/dropdown/Dropdown";
import MappingDialog from "../../components/mapping-dialog/MappingDialog";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import PageHeader from "../../components/page-header/PageHeader";
import {
    CategoryComboModel,
    CategoryOptionModel,
    D2Model,
    DataElementModel,
    OrganisationUnitModel,
} from "../../models/d2Model";
import Instance, { MetadataMapping } from "../../models/instance";
import { D2 } from "../../types/d2";
import { MetadataType } from "../../utils/d2";
import { cleanOrgUnitPath, cleanOrgUnitPaths } from "../../utils/synchronization";

const models: typeof D2Model[] = [
    DataElementModel,
    CategoryComboModel,
    CategoryOptionModel,
    OrganisationUnitModel,
];

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

export const getInstances = async (d2: D2) => {
    const { objects } = await Instance.list(d2, {}, { paging: false });
    return objects;
};

const queryApi = (instance: Instance, type: keyof D2ModelSchemas, ids: string[]) => {
    return instance
        .getApi()
        .metadata.get({
            [type]: {
                fields: {
                    id: true,
                    name: true,
                },
                filter: {
                    id: {
                        in: cleanOrgUnitPaths(ids),
                    },
                },
            },
        })
        .getData();
};

interface NamedMetadataMapping extends MetadataMapping {
    name: ReactNode;
}

interface WarningDialog {
    title?: string;
    description?: string;
    action?: () => void;
}

const InstanceMappingPage: React.FC = () => {
    const d2 = useD2();
    const api = useD2Api();
    const history = useHistory();
    const classes = useStyles();
    const snackbar = useSnackbar();
    const loading = useLoading();
    const { id: instanceFilterDefault = "" } = useParams() as { id: string };

    const [model, setModel] = useState<typeof D2Model>(() => models[0] ?? DataElementModel);
    const type = model.getCollectionName();
    const [instance, setInstance] = useState<Instance>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [warningDialog, setWarningDialog] = useState<WarningDialog | null>(null);
    const [instanceOptions, setInstanceOptions] = useState<Instance[]>([]);
    const [instanceFilter, setInstanceFilter] = useState<string>(instanceFilterDefault);
    const [elementsToMap, setElementsToMap] = useState<TableSelection[]>([]);
    const [rows, setRows] = useState<MetadataType[]>([]);
    const [dictionary, setDictionary] = useState<{
        [id: string]: NamedMetadataMapping;
    }>({});

    useEffect(() => {
        getInstances(d2 as D2).then(setInstanceOptions);
    }, [d2]);

    useEffect(() => {
        Instance.get(d2 as D2, instanceFilter).then(setInstance);
    }, [d2, instanceFilter]);

    useEffect(() => {
        if (!instance || rows.length === 0) return;
        setLoading(true);
        const ids = rows.map(({ id }) =>
            _.get(instance?.metadataMapping, [type, id, "mappedId"], id)
        );

        const updateDictionary = (response: any) => {
            const newMappings = _.mapKeys(
                rows.map(({ id: originalId }) => {
                    const defaultName = response
                        ? i18n.t("Item not found")
                        : i18n.t("Could not connect with instance");
                    const collection = response ? response[type] : {};
                    const mappedId = _.get(
                        instance.metadataMapping,
                        [type, originalId, "mappedId"],
                        originalId
                    );
                    const cleanId = cleanOrgUnitPath(mappedId);
                    const name = _.find(collection, ["id", cleanId])?.name ?? defaultName;

                    return { originalId, mappedId, name };
                }),
                ({ originalId }) => `${instance.id}-${type}-${originalId}`
            );

            setDictionary(prevDictionary => ({
                ...prevDictionary,
                ...newMappings,
            }));

            setLoading(false);
        };

        queryApi(instance, type, ids)
            .then(updateDictionary)
            .catch(() => updateDictionary(null));
    }, [instance, rows, type, setLoading]);

    const applyMapping = useCallback(
        async (selection: TableSelection[], mappedId: string | undefined) => {
            if (!instance) {
                snackbar.error(i18n.t("Please select an instance from the dropdown"), {
                    autoHideDuration: 2500,
                });
                return;
            }

            try {
                const newMapping = _.cloneDeep(instance.metadataMapping);
                for (const item of selection) {
                    _.unset(newMapping, [type, item.id]);
                    _.unset(dictionary, `${instance.id}-${type}-${item.id}`);
                    if (mappedId) _.set(newMapping, [type, item.id], { mappedId });
                }

                const newInstance = instance.setMetadataMapping(newMapping);
                await newInstance.save(d2 as D2);
                setInstance(newInstance);
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
                snackbar.error(i18n.t("Could not apply mapping, please try again."));
            }
        },
        [d2, dictionary, instance, snackbar, type]
    );

    const updateMapping = async (mappedId: string) => {
        applyMapping(elementsToMap, mappedId);
    };

    const disableMapping = async (_items: MetadataType[], selection: TableSelection[]) => {
        applyMapping(selection, "DISABLED");
    };

    const resetMapping = async (_items: MetadataType[], selection: TableSelection[]) => {
        applyMapping(selection, undefined);
    };

    const applyAutoMapping = async (_items: MetadataType[], selection: TableSelection[]) => {
        if (!instance) {
            snackbar.error(i18n.t("Please select an instance from the dropdown"), {
                autoHideDuration: 2500,
            });
            return;
        }

        loading.show(true, i18n.t("Looking for candidates to apply auto-maping"));

        const { objects: originalObjects } = await model
            .getApiModel(api)
            .get({
                fields: {
                    id: true,
                    name: true,
                    displayName: true,
                    code: true,
                },
                filter: {
                    id: {
                        in: selection.map(({ id }) => id),
                    },
                },
            })
            .getData();

        for (const item of selection) {
            const original = _.find(originalObjects, ["id", item.id]);
            loading.updateMessage(i18n.t("Applying auto-maping for {{name}}", original));

            const { objects: candidates } = await instance
                .getApi()
                //@ts-ignore
                .models[type].get({
                    fields: { id: true },
                    filter: {
                        name: { ilike: original?.name },
                        displayName: { ilike: original?.displayName },
                        code: { eq: original?.code },
                    },
                    rootJunction: "OR",
                })
                .getData();

            if (candidates.length === 1) {
                await applyMapping([item], candidates[0].id);
            }
        }

        loading.reset();
    };

    const openMappingDialog = useCallback(
        (_items: MetadataType[], selection: TableSelection[]) => {
            if (!instance) {
                snackbar.error(i18n.t("Please select an instance from the dropdown"), {
                    autoHideDuration: 2500,
                });
            } else {
                setElementsToMap(selection);
                setSelectedIds([]);
            }
        },
        [instance, snackbar]
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
                    const mappedId = _.get(
                        instance?.metadataMapping,
                        [type, row.id, "mappedId"],
                        row.id
                    );
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
                                    onClick={() => openMappingDialog([row], [{ id: row.id }])}
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
                    const key = `${instance?.id}-${type}-${row.id}`;
                    const defaultName = instance
                        ? i18n.t("Loading...")
                        : i18n.t("Please select an instance");
                    const { name, mappedId } = dictionary[key] ?? {};

                    return mappedId === "DISABLED" ? "-" : name ?? defaultName;
                },
            },
        ],
        [classes, dictionary, type, instance, openMappingDialog]
    );

    const filters: ReactNode = useMemo(
        () => (
            <React.Fragment>
                <div className={classes.instanceDropdown}>
                    <Dropdown
                        key={"instance-filter"}
                        items={instanceOptions}
                        onValueChange={setInstanceFilter}
                        value={instanceFilter}
                        label={i18n.t("Instance selection")}
                    />
                </div>
                <Fab
                    className={classes.actionButtons}
                    color="primary"
                    onClick={() => {
                        if (selectedIds.length > 0) {
                            setWarningDialog({
                                title: i18n.t("Reset mapping to default value"),
                                description: i18n.t(
                                    "Are you sure you want to clear mapping for {{total}} elements?",
                                    {
                                        total: selectedIds.length,
                                    }
                                ),
                                action: () =>
                                    applyMapping(
                                        selectedIds.map(id => ({ id })),
                                        undefined
                                    ),
                            });
                        } else {
                            snackbar.error(
                                i18n.t("Please select at least one item to reset mapping")
                            );
                        }
                    }}
                    variant={"extended"}
                >
                    {i18n.t("Reset mapping")}
                </Fab>
                <Fab
                    className={classes.actionButtons}
                    color="primary"
                    onClick={() => {
                        if (selectedIds.length > 0) {
                            setWarningDialog({
                                title: i18n.t("Disable mapping"),
                                description: i18n.t(
                                    "Are you sure you want to disable mapping for {{total}} elements?",
                                    {
                                        total: selectedIds.length,
                                    }
                                ),
                                action: () =>
                                    applyMapping(
                                        selectedIds.map(id => ({ id })),
                                        "DISABLED"
                                    ),
                            });
                        } else {
                            snackbar.error(
                                i18n.t("Please select at least one item to disable mapping")
                            );
                        }
                    }}
                    variant={"extended"}
                >
                    {i18n.t("Disable mapping")}
                </Fab>
            </React.Fragment>
        ),
        [classes, instanceOptions, instanceFilter, snackbar, selectedIds, applyMapping]
    );

    const actions: TableAction<MetadataType>[] = [
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
            isActive: () => type === "dataElements" || type === "organisationUnits",
        },
        {
            name: "reset-mapping",
            text: i18n.t("Reset mapping to default values"),
            multiple: true,
            onClick: resetMapping,
            icon: <Icon>clear</Icon>,
        },
    ];

    const backHome = () => {
        history.push("/instances");
    };

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Metadata mapping")} onBackClick={backHome} />

            {!!warningDialog && (
                <ConfirmationDialog
                    open={true}
                    title={warningDialog.title}
                    description={warningDialog.description}
                    saveText={i18n.t("Ok")}
                    onSave={() => {
                        if (warningDialog.action) warningDialog.action();
                        setWarningDialog(null);
                    }}
                    onCancel={() => setWarningDialog(null)}
                />
            )}

            {!!instanceFilter && elementsToMap.length > 0 && (
                <MappingDialog
                    rows={rows}
                    model={model}
                    elements={elementsToMap}
                    onUpdateMapping={updateMapping}
                    onClose={() => setElementsToMap([])}
                    instance={instance}
                />
            )}

            <MetadataTable
                models={models}
                additionalColumns={columns}
                additionalFilters={filters}
                additionalActions={actions}
                notifyNewModel={model => {
                    setLoading(!!instance);
                    setRows([]);
                    setSelectedIds([]);
                    setModel(() => model);
                }}
                notifyRowsChange={setRows}
                loading={isLoading}
                selectedIds={selectedIds}
                notifyNewSelection={setSelectedIds}
            />
        </React.Fragment>
    );
};

export default InstanceMappingPage;
