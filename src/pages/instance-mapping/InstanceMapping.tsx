import i18n from "@dhis2/d2-i18n";
import { Icon, IconButton, makeStyles, Typography } from "@material-ui/core";
import { useD2 } from "d2-api";
import { TableColumn, ConfirmationDialog } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Dropdown from "../../components/dropdown/Dropdown";
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
});

export const getInstances = async (d2: D2) => {
    const { objects } = await Instance.list(d2, {}, { paging: false });
    return objects;
};

const InstanceMappingPage: React.FC = () => {
    const d2 = useD2();
    const history = useHistory();
    const classes = useStyles();

    const [instanceOptions, setInstanceOptions] = useState<Instance[]>([]);
    const [instanceFilter, updateInstanceFilter] = useState<string>("");
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
                            onClick={() => openDialog(row.id)}
                        >
                            <Icon color="primary">open_in_new</Icon>
                        </IconButton>
                    </span>
                );
            },
        },
    ];

    const filters = (
        <Dropdown
            key={"instance-filter"}
            items={instanceOptions}
            onValueChange={updateInstanceFilter}
            value={instanceFilter}
            label={i18n.t("Instance selection")}
        />
    );

    useEffect(() => {
        getInstances(d2 as D2).then(setInstanceOptions);
    }, [d2]);

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Metadata mapping")} onBackClick={backHome} />

            <ConfirmationDialog
                isOpen={!!elementToEditMapping}
                title={i18n.t("Edit mapping")}
                onCancel={() => openDialog(null)}
                fullWidth
            />

            <MetadataTable
                models={models}
                additionalColumns={columns}
                additionalFilters={filters}
            />
        </React.Fragment>
    );
};

export default InstanceMappingPage;
