import i18n from "@dhis2/d2-i18n";
import { Fab, Icon, IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core";
import { D2ModelSchemas, useD2 } from "d2-api";
import { ConfirmationDialog, TableAction, TableColumn, useSnackbar } from "d2-ui-components";
import _ from "lodash";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Dropdown from "../../components/dropdown/Dropdown";
import MappingDialog from "../../components/mapping-dialog/MappingDialog";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import PageHeader from "../../components/page-header/PageHeader";
import {
    AggregatedDataElementModel,
    CategoryComboModel,
    CategoryOptionModel,
    D2Model,
    DataElementModel,
    OrganisationUnitModel,
    ProgramDataElementModel,
} from "../../models/d2Model";
import Instance from "../../models/instance";
import { D2 } from "../../types/d2";
import { MetadataType } from "../../utils/d2";
import { cleanOrgUnitPath } from "../../utils/synchronization";

export type MappingType = "aggregated" | "tracker" | "orgUnit";

const config = {
    aggregated: { models: [AggregatedDataElementModel, CategoryComboModel, CategoryOptionModel] },
    tracker: { models: [ProgramDataElementModel, CategoryComboModel, CategoryOptionModel] },
    orgUnit: { models: [OrganisationUnitModel] },
};

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

const getName = async (instance: Instance, type: keyof D2ModelSchemas, id: string) => {
    const response = await instance
        .getApi()
        .metadata.get({
            [type]: {
                fields: {
                    id: true,
                    name: true,
                },
                filter: {
                    id: {
                        eq: cleanOrgUnitPath(id),
                    },
                },
            },
        })
        .getData();

    return _.get(response, [type, 0, "name"]);
};

interface WarningDialog {
    title?: string;
    description?: string;
    action?: () => void;
}

interface InstanceMappingParams {
    id: string;
    section: MappingType;
}

const InstanceMappingPage: React.FC = () => {
    const d2 = useD2();
    const history = useHistory();
    const classes = useStyles();
    const snackbar = useSnackbar();

    const { id: instanceFilterDefault = "", section } = useParams() as InstanceMappingParams;
    const { models } = config[section];
    const [model, setModel] = useState<typeof D2Model>(() => models[0] ?? DataElementModel);
    const type = model.getCollectionName();

    const [instance, setInstance] = useState<Instance>();
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [warningDialog, setWarningDialog] = useState<WarningDialog | null>(null);
    const [instanceOptions, setInstanceOptions] = useState<Instance[]>([]);
    const [instanceFilter, setInstanceFilter] = useState<string>(instanceFilterDefault);
    const [elementsToMap, setElementsToMap] = useState<string[]>([]);
    const [rows, setRows] = useState<MetadataType[]>([]);

    useEffect(() => {
        getInstances(d2 as D2).then(setInstanceOptions);
    }, [d2]);

    useEffect(() => {
        Instance.get(d2 as D2, instanceFilter).then(setInstance);
    }, [d2, instanceFilter]);

    const applyMapping = useCallback(
        async (selection: string[], mappedId: string | undefined) => {
            if (!instance) {
                snackbar.error(i18n.t("Please select an instance from the dropdown"), {
                    autoHideDuration: 2500,
                });
                return;
            }

            try {
                const newMapping = _.cloneDeep(instance.metadataMapping);
                for (const item of selection) {
                    _.unset(newMapping, [type, item]);
                    if (mappedId) {
                        const name = await getName(instance, type, mappedId);
                        _.set(newMapping, [type, item], { mappedId, name });
                    }
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
        [d2, instance, snackbar, type]
    );

    const updateMapping = useCallback(
        async (mappedId: string) => {
            applyMapping(elementsToMap, mappedId);
        },
        [applyMapping, elementsToMap]
    );

    const disableMapping = useCallback(
        async (selection: string[]) => {
            applyMapping(selection, "DISABLED");
        },
        [applyMapping]
    );

    const resetMapping = useCallback(
        async (selection: string[]) => {
            applyMapping(selection, undefined);
        },
        [applyMapping]
    );

    const openMappingDialog = useCallback(
        (selection: string[]) => {
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
                                    onClick={() => openMappingDialog([row.id])}
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
                    const { mappedId, name } = _.get(instance?.metadataMapping, [type, row.id], {
                        mappedId: row.id,
                        name: i18n.t("Not mapped"),
                    });

                    return mappedId === "DISABLED" ? "-" : name;
                },
            },
        ],
        [classes, type, instance, openMappingDialog]
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
                                action: () => applyMapping(selectedIds, undefined),
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
                                action: () => applyMapping(selectedIds, "DISABLED"),
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
        ],
        [disableMapping, openMappingDialog, resetMapping, type]
    );

    const backHome = () => {
        history.push("/instances/mapping");
    };

    const notifyNewModel = useCallback(
        model => {
            setLoading(!!instance);
            setRows([]);
            setSelectedIds([]);
            setModel(() => model);
        },
        [instance]
    );

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
                notifyNewModel={notifyNewModel}
                notifyRowsChange={setRows}
                loading={loading}
                selectedIds={selectedIds}
                notifyNewSelection={setSelectedIds}
            />
        </React.Fragment>
    );
};

export default InstanceMappingPage;
