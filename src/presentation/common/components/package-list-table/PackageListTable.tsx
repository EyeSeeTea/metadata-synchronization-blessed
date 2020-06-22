import i18n from "@dhis2/d2-i18n";
import { Icon } from "@material-ui/core";
import {
    ObjectsTable,
    ObjectsTableDetailField,
    TableAction,
    TableColumn,
    useLoading,
    useSnackbar,
} from "d2-ui-components";
import _ from "lodash";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { Package } from "../../../../domain/modules/entities/Package";
import { useAppContext } from "../../contexts/AppContext";

type PackagesListPresentations = "app" | "widget";

interface PackagesListTableProps {
    onActionButtonClick?: (event: React.MouseEvent<unknown, MouseEvent>) => void;
    presentation?: PackagesListPresentations;
    externalComponents?: ReactNode;
}

export const PackagesListTable: React.FC<PackagesListTableProps> = ({
    onActionButtonClick,
    presentation = "app",
    externalComponents,
}) => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();
    const [rows, setRows] = useState<Package[]>([]);
    const [resetKey, setResetKey] = useState(Math.random());

    const deletePackage = useCallback(
        async (ids: string[]) => {
            const item = _.find(rows, ({ id }) => id === ids[0]);
            if (!item) snackbar.error(i18n.t("Invalid package"));
            else {
                loading.show(true, "Deleting package");
                await compositionRoot.packages.delete(item);
                loading.reset();
                setResetKey(Math.random());
            }
        },
        [compositionRoot, rows, snackbar, loading, setResetKey]
    );

    const downloadPackage = useCallback(
        async (ids: string[]) => {
            const item = _.find(rows, ({ id }) => id === ids[0]);
            if (!item) snackbar.error(i18n.t("Invalid package"));
            else compositionRoot.packages.download(item);
        },
        [compositionRoot, rows, snackbar]
    );

    const columns: TableColumn<Package>[] = [
        { name: "name", text: i18n.t("Name"), sortable: true },
        {
            name: "location",
            text: i18n.t("Location"),
            sortable: true,
            getValue: ({ location }) => {
                if (location === "dataStore") return i18n.t("Data Store");
                else if (location === "github") return i18n.t("GitHub");
                else return i18n.t("Unknown");
            },
        },
        { name: "module", text: i18n.t("Module"), sortable: true },
    ];

    const details: ObjectsTableDetailField<Package>[] = [{ name: "name", text: i18n.t("Name") }];

    const actions: TableAction<Package>[] = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            isActive: () => presentation === "app",
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            multiple: false,
            onClick: deletePackage,
            icon: <Icon>delete</Icon>,
        },
        {
            name: "download",
            text: i18n.t("Download"),
            multiple: false,
            onClick: downloadPackage,
            icon: <Icon>cloud_download</Icon>,
        },
    ];

    useEffect(() => {
        compositionRoot.packages.list().then(setRows);
    }, [compositionRoot, resetKey]);

    return (
        <ObjectsTable<Package>
            rows={rows}
            columns={columns}
            details={details}
            actions={actions}
            onActionButtonClick={onActionButtonClick}
            forceSelectionColumn={true}
            filterComponents={externalComponents}
        />
    );
};
