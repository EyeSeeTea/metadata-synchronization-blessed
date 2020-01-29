import i18n from "@dhis2/d2-i18n";
import { Icon, IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core";
import { D2ModelSchemas, useD2 } from "d2-api";
import { TableAction, TableColumn, useSnackbar } from "d2-ui-components";
import _ from "lodash";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Dropdown from "../../components/dropdown/Dropdown";
import MappingDialog from "../../components/mapping-dialog/MappingDialog";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import PageHeader from "../../components/page-header/PageHeader";
import {
    CategoryOptionModel,
    D2Model,
    DataElementModel,
    OrganisationUnitModel,
    ProgramModel,
    ProgramStageModel,
} from "../../models/d2Model";
import Instance, { MetadataMapping } from "../../models/instance";
import { D2 } from "../../types/d2";
import { MetadataType } from "../../utils/d2";
import { cleanOrgUnitPath, cleanOrgUnitPaths } from "../../utils/synchronization";

const models: typeof D2Model[] = [
    DataElementModel,
    CategoryOptionModel,
    OrganisationUnitModel,
    ProgramModel,
    ProgramStageModel,
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

const InstanceMappingPage: React.FC = () => {
    const d2 = useD2();
    const history = useHistory();
    const classes = useStyles();
    const snackbar = useSnackbar();
    const { id: instanceFilterDefault = "" } = useParams() as { id: string };

    const [model, setModel] = useState<typeof D2Model>(() => models[0] ?? DataElementModel);
    const type = model.getCollectionName();
    const [instance, setInstance] = useState<Instance>();
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [instanceOptions, setInstanceOptions] = useState<Instance[]>([]);
    const [instanceFilter, setInstanceFilter] = useState<string>(instanceFilterDefault);
    const [elementToMap, setElementToMap] = useState<MetadataType | null>(null);
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

    const updateMapping = async (mappedId: string) => {
        if (!instance || !elementToMap || !mappedId) return;
        const { id: originalId, displayName } = elementToMap;

        try {
            const newInstance = instance.setMetadataMapping(
                _.set(instance.metadataMapping, [type, originalId], {
                    mappedId,
                })
            );
            newInstance.save(d2 as D2);
            setInstance(newInstance);

            const response = await queryApi(instance, type, [mappedId]);
            dictionary[`${instance.id}-${type}-${originalId}`] = {
                mappedId,
                name: _.find(response[type], ["id", mappedId])?.name,
            };

            snackbar.info(
                i18n.t("Selected {{id}} to map with {{displayName}}", {
                    id: cleanOrgUnitPath(mappedId),
                    displayName,
                }),
                { autoHideDuration: 2500 }
            );
        } catch (e) {
            snackbar.error(i18n.t("Could not apply mapping, please try again."));
        }
    };

    const clearMapping = async (items: MetadataType[]) => {
        if (!instance) {
            snackbar.error(i18n.t("Please select an instance from the dropdown"), {
                autoHideDuration: 2500,
            });
            return;
        }

        const newMapping = _.cloneDeep(instance.metadataMapping);
        for (const item of items) {
            _.unset(newMapping, [type, item.id]);
            _.unset(dictionary, `${instance.id}-${type}-${item.id}`);
        }

        const newInstance = instance.setMetadataMapping(newMapping);
        await newInstance.save(d2 as D2);
        setInstance(newInstance);

        snackbar.info(
            i18n.t("Cleared mapping for {{total}} elements", {
                total: items.length,
            }),
            { autoHideDuration: 2500 }
        );
    };

    const openMappingDialog = useCallback(
        (row: MetadataType) => {
            if (!instance) {
                snackbar.error(i18n.t("Please select an instance from the dropdown"), {
                    autoHideDuration: 2500,
                });
            } else if (loading) {
                snackbar.warning(i18n.t("Please wait to finish loading"), {
                    autoHideDuration: 2500,
                });
            } else {
                setElementToMap(row);
            }
            setSelectedIds([]);
        },
        [instance, loading, snackbar]
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

                    return (
                        <span>
                            <Typography variant={"inherit"} gutterBottom>
                                {cleanId}
                            </Typography>
                            <Tooltip title={i18n.t("Set mapping")} placement="top">
                                <IconButton
                                    className={classes.iconButton}
                                    onClick={() => openMappingDialog(row)}
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

                    return dictionary[key]?.name ?? defaultName;
                },
            },
        ],
        [classes, dictionary, type, instance, openMappingDialog]
    );

    const filters: ReactNode = useMemo(
        () => (
            <div className={classes.instanceDropdown}>
                <Dropdown
                    key={"instance-filter"}
                    items={instanceOptions}
                    onValueChange={setInstanceFilter}
                    value={instanceFilter}
                    label={i18n.t("Instance selection")}
                />
            </div>
        ),
        [classes, instanceOptions, instanceFilter]
    );

    const actions: TableAction<MetadataType>[] = [
        {
            name: "select",
            text: "Select",
            isActive: () => false,
        },
        {
            name: "map",
            text: i18n.t("Set mapping"),
            multiple: false,
            onClick: (rows: MetadataType[]) => {
                if (rows.length === 1) openMappingDialog(rows[0]);
            },
            icon: <Icon>open_in_new</Icon>,
        },
        {
            name: "clear",
            text: i18n.t("Clear mapping"),
            multiple: true,
            onClick: clearMapping,
            icon: <Icon>clear</Icon>,
        },
    ];

    const backHome = () => {
        history.push("/");
    };

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Metadata mapping")} onBackClick={backHome} />

            {!!elementToMap && !!instanceFilter && (
                <MappingDialog
                    model={model}
                    element={elementToMap}
                    onUpdateMapping={updateMapping}
                    onClose={() => setElementToMap(null)}
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
                loading={loading}
                selectedIds={selectedIds}
                notifyNewSelection={selectedIds => setSelectedIds(selectedIds)}
                ids={
                    // TODO: https://github.com/EyeSeeTea/d2-ui-components/issues/118
                    undefined
                }
            />
        </React.Fragment>
    );
};

export default InstanceMappingPage;
