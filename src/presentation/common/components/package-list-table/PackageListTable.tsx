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
import { Instance } from "../../../../domain/instance/entities/Instance";
import { Package } from "../../../../domain/modules/entities/Package";
import { useAppContext } from "../../contexts/AppContext";

type PackagesListPresentations = "app" | "widget";
type ListPackage = Omit<Package, "contents">;

interface PackagesListTableProps {
    remoteInstance?: Instance;
    onActionButtonClick?: (event: React.MouseEvent<unknown, MouseEvent>) => void;
    presentation?: PackagesListPresentations;
    externalComponents?: ReactNode;
}

export const PackagesListTable: React.FC<PackagesListTableProps> = ({
    remoteInstance,
    onActionButtonClick,
    presentation = "app",
    externalComponents,
}) => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();
    const [rows, setRows] = useState<ListPackage[]>([]);
    const [resetKey, setResetKey] = useState(Math.random());

    const deletePackage = useCallback(
        async (ids: string[]) => {
            loading.show(true, "Deleting package");
            const item = _.find(rows, ({ id }) => id === ids[0]);
            if (!item) snackbar.error(i18n.t("Invalid package"));
            else await compositionRoot.packages(remoteInstance).delete(item.id);
            loading.reset();
            setResetKey(Math.random());
        },
        [compositionRoot, remoteInstance, rows, snackbar, loading, setResetKey]
    );

    const downloadPackage = useCallback(
        async (ids: string[]) => {
            try {
                compositionRoot.packages(remoteInstance).download(ids[0]);
            } catch (error) {
                snackbar.error(i18n.t("Invalid package"));
            }
        },
        [compositionRoot, remoteInstance, snackbar]
    );

    const columns: TableColumn<ListPackage>[] = [
        { name: "name", text: i18n.t("Name"), sortable: true },
        { name: "version", text: i18n.t("DHIS2 Version"), sortable: true },
        { name: "module", text: i18n.t("Module"), sortable: true },
    ];

    const details: ObjectsTableDetailField<ListPackage>[] = [
        { name: "id", text: i18n.t("ID") },
        { name: "name", text: i18n.t("Name") },
        { name: "version", text: i18n.t("DHIS2 Version") },
        { name: "module", text: i18n.t("Module") },
    ];

    const actions: TableAction<ListPackage>[] = [
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
            isActive: () => presentation !== "app" && !remoteInstance,
        },
        {
            name: "download",
            text: i18n.t("Download as JSON"),
            multiple: false,
            onClick: downloadPackage,
            icon: <Icon>cloud_download</Icon>,
        },
        {
            name: "publish",
            text: i18n.t("Publish to Store"),
            multiple: false,
            onClick: () => snackbar.warning("Not implemented yet"),
            icon: <Icon>publish</Icon>,
            isActive: () => presentation !== "app" && !remoteInstance,
        },
    ];

    useEffect(() => {
        compositionRoot
            .packages(remoteInstance)
            .list()
            .then(setRows)
            .catch((error: Error) => {
                snackbar.error(error.message);
                setRows([]);
            });
    }, [compositionRoot, remoteInstance, resetKey, snackbar]);

    return (
        <ObjectsTable<ListPackage>
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
