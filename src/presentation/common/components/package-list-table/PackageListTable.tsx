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
import { BasePackage } from "../../../../domain/modules/entities/Package";
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
    const [rows, setRows] = useState<BasePackage[]>([]);
    const [resetKey, setResetKey] = useState(Math.random());

    const deletePackage = useCallback(
        async (ids: string[]) => {
            loading.show(true, "Deleting package");
            const item = _.find(rows, ({ id }) => id === ids[0]);
            if (!item) snackbar.error(i18n.t("Invalid package"));
            else await compositionRoot.packages.delete(item.location, item.id);
            loading.reset();
            setResetKey(Math.random());
        },
        [compositionRoot, rows, snackbar, loading, setResetKey]
    );

    const downloadPackage = useCallback(
        async (ids: string[]) => {
            try {
                compositionRoot.packages.download(ids[0]);
            } catch (error) {
                snackbar.error(i18n.t("Invalid package"));
            }
        },
        [compositionRoot, snackbar]
    );

    const columns: TableColumn<BasePackage>[] = [
        { name: "name", text: i18n.t("Name"), sortable: true },
        {
            name: "location",
            text: i18n.t("Location"),
            sortable: true,
            getValue: ({ location }) => {
                if (location === "dataStore") return i18n.t("Local instance");
                else if (location === "github") return i18n.t("GitHub");
                else return i18n.t("Unknown");
            },
        },
        { name: "version", text: i18n.t("DHIS2 Version"), sortable: true },
        { name: "module", text: i18n.t("Module"), sortable: true },
    ];

    const details: ObjectsTableDetailField<BasePackage>[] = [
        { name: "id", text: i18n.t("ID") },
        { name: "name", text: i18n.t("Name") },
        {
            name: "location",
            text: i18n.t("Location"),
            getValue: ({ location }) => {
                if (location === "dataStore") return i18n.t("Local instance");
                else if (location === "github") return i18n.t("GitHub");
                else return i18n.t("Unknown");
            },
        },
        { name: "version", text: i18n.t("DHIS2 Version") },
        { name: "module", text: i18n.t("Module") },
    ];

    const actions: TableAction<BasePackage>[] = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            multiple: false,
            onClick: deletePackage,
            icon: <Icon>delete</Icon>,
            isActive: () => presentation === "app",
        },
        {
            name: "download",
            text: i18n.t("Download"),
            multiple: false,
            onClick: downloadPackage,
            icon: <Icon>cloud_download</Icon>,
        },
        {
            name: "publish",
            text: i18n.t("Publish"),
            multiple: false,
            onClick: downloadPackage,
            icon: <Icon>publish</Icon>,
        },
    ];

    useEffect(() => {
        compositionRoot.packages.list().then(setRows);
    }, [compositionRoot, resetKey]);

    return (
        <ObjectsTable<BasePackage>
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
