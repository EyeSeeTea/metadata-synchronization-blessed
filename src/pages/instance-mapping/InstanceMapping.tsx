import i18n from "@dhis2/d2-i18n";
import { Icon, IconButton, makeStyles, Typography } from "@material-ui/core";
import { useD2 } from "d2-api";
import { TableColumn, useSnackbar } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Dropdown from "../../components/dropdown/Dropdown";
import MappingDialog from "../../components/mapping-dialog/MappingDialog";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import PageHeader from "../../components/page-header/PageHeader";
import { D2Model, DataElementModel, OrganisationUnitModel } from "../../models/d2Model";
import Instance from "../../models/instance";
import { D2 } from "../../types/d2";
import { MetadataType } from "../../utils/d2";

const models: typeof D2Model[] = [DataElementModel, OrganisationUnitModel];

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

const InstanceMappingPage: React.FC = () => {
    const d2 = useD2();
    const history = useHistory();
    const classes = useStyles();
    const snackbar = useSnackbar();
    const { id: instanceFilterDefault = "" } = useParams() as { id: string };

    const [instanceOptions, setInstanceOptions] = useState<Instance[]>([]);
    const [model, setModel] = useState<typeof D2Model>(() => models[0] ?? DataElementModel);
    const [instanceFilter, updateInstanceFilter] = useState<string>(instanceFilterDefault);
    const [elementToEditMapping, openDialog] = useState<string | null>(null);

    const backHome = () => {
        history.push("/");
    };

    const columns: TableColumn<MetadataType>[] = [
        {
            name: "mapped-id",
            text: "Mapped ID",
            getValue: (row: MetadataType) => {
                // TODO: When logic is done, we should load here the mapped id (if any)
                return (
                    <span>
                        <Typography variant={"inherit"} gutterBottom>
                            {row.id}
                        </Typography>
                        <IconButton
                            className={classes.iconButton}
                            onClick={() =>
                                instanceFilter
                                    ? openDialog(row.id)
                                    : snackbar.error(
                                          i18n.t("Please select an instance from the dropdown")
                                      )
                            }
                        >
                            <Icon color="primary">open_in_new</Icon>
                        </IconButton>
                    </span>
                );
            },
        },
    ];

    const filters = (
        <div className={classes.instanceDropdown}>
            <Dropdown
                key={"instance-filter"}
                items={instanceOptions}
                onValueChange={updateInstanceFilter}
                value={instanceFilter}
                label={i18n.t("Instance selection")}
            />
        </div>
    );

    useEffect(() => {
        getInstances(d2 as D2).then(setInstanceOptions);
    }, [d2]);

    const updateModel = (model: typeof D2Model) => {
        setModel(() => model);
    };

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Metadata mapping")} onBackClick={backHome} />

            {!!elementToEditMapping && !!instanceFilter && (
                <MappingDialog
                    model={model}
                    element={elementToEditMapping}
                    onUpdateMapping={console.log}
                    onClose={() => openDialog(null)}
                    instance={instanceFilter}
                />
            )}

            <MetadataTable
                models={models}
                additionalColumns={columns}
                additionalFilters={filters}
                notifyNewModel={updateModel}
            />
        </React.Fragment>
    );
};

export default InstanceMappingPage;
