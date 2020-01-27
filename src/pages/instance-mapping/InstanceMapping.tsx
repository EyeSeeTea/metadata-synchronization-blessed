import i18n from "@dhis2/d2-i18n";
import { Icon, IconButton, makeStyles, Typography } from "@material-ui/core";
import { D2ModelSchemas, useD2 } from "d2-api";
import { TableColumn, useSnackbar } from "d2-ui-components";
import _ from "lodash";
import React, { ReactNode, useEffect, useMemo, useState, useCallback } from "react";
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
} from "../../models/d2Model";
import Instance, { MetadataMapping } from "../../models/instance";
import { D2 } from "../../types/d2";
import { MetadataType } from "../../utils/d2";
import { cleanOrgUnitPaths } from "../../utils/synchronization";

const models: typeof D2Model[] = [DataElementModel, CategoryOptionModel, OrganisationUnitModel];

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
                        in: ids,
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

    const [instanceOptions, setInstanceOptions] = useState<Instance[]>([]);
    const [instanceFilter, updateInstanceFilter] = useState<string>(instanceFilterDefault);
    const [elementToMap, updateElementToMap] = useState<MetadataType | null>(null);
    const [rows, updateRows] = useState<MetadataType[]>([]);
    const [dictionary, updateDictionary] = useState<{
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

        const updateMapping = (response: any) => {
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
                    const name = _.find(collection, ["id", mappedId])?.name ?? defaultName;

                    return { originalId, mappedId, name };
                }),
                ({ originalId }) => `${instance.id}-${type}-${originalId}`
            );

            updateDictionary(prevDictionary => ({
                ...prevDictionary,
                ...newMappings,
            }));

            setLoading(false);
        };

        queryApi(instance, type, ids)
            .then(updateMapping)
            .catch(() => updateMapping(null));
    }, [instance, rows, type, setLoading]);

    const updateMapping = async (ids: string) => {
        const originalId = elementToMap?.id;
        const mappedId = _.first(cleanOrgUnitPaths([ids]));

        if (!instance || !originalId || !mappedId) return;

        await instance
            .setMetadataMapping(
                _.set(instance.metadataMapping, [type, originalId], {
                    mappedId,
                })
            )
            .save(d2 as D2);

        const response = await queryApi(instance, type, [mappedId]);
        dictionary[`${instance.id}-${type}-${originalId}`] = {
            mappedId,
            name: _.find(response[type], ["id", mappedId])?.name,
        };

        snackbar.info(
            i18n.t("Selected {{id}} to map with {{originalId}}", {
                mappedId,
                originalId,
            }),
            { autoHideDuration: 1000 }
        );
    };

    const openMappingDialog = useCallback(
        (row: MetadataType) => {
            if (!instance) {
                snackbar.error(i18n.t("Please select an instance from the dropdown"), {
                    autoHideDuration: 1000,
                });
            } else if (loading) {
                snackbar.warning(i18n.t("Please wait to finish loading"), {
                    autoHideDuration: 1000,
                });
            } else {
                updateElementToMap(row);
            }
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

                    return (
                        <span>
                            <Typography variant={"inherit"} gutterBottom>
                                {mappedId}
                            </Typography>
                            <IconButton
                                className={classes.iconButton}
                                onClick={() => openMappingDialog(row)}
                            >
                                <Icon color="primary">open_in_new</Icon>
                            </IconButton>
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

    const filters = useMemo(
        () => (
            <div className={classes.instanceDropdown}>
                <Dropdown
                    key={"instance-filter"}
                    items={instanceOptions}
                    onValueChange={updateInstanceFilter}
                    value={instanceFilter}
                    label={i18n.t("Instance selection")}
                />
            </div>
        ),
        [classes, instanceOptions, instanceFilter]
    );

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
                    onClose={() => updateElementToMap(null)}
                    instance={instance}
                />
            )}

            <MetadataTable
                models={models}
                additionalColumns={columns}
                additionalFilters={filters}
                notifyNewModel={model => {
                    setLoading(true);
                    updateRows([]);
                    setModel(() => model);
                }}
                notifyRowsChange={updateRows}
                loading={loading}
            />
        </React.Fragment>
    );
};

export default InstanceMappingPage;
