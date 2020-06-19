import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, ObjectsTableDetailField, TableAction, TableColumn } from "d2-ui-components";
import React, { ReactNode, useEffect, useState } from "react";
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
    const [rows, setRows] = useState<Package[]>([]);

    const columns: TableColumn<Package>[] = [
        { name: "name", text: i18n.t("Name"), sortable: true },
    ];

    const details: ObjectsTableDetailField<Package>[] = [{ name: "name", text: i18n.t("Name") }];

    const actions: TableAction<Package>[] = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            isActive: () => presentation === "app",
        },
    ];

    useEffect(() => {
        compositionRoot.packages.list().then(setRows);
    }, [compositionRoot]);

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
