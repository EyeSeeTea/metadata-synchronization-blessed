import SyncIcon from "@material-ui/icons/Sync";
import {
    DatePicker,
    ObjectsTable,
    ObjectsTableDetailField,
    ReferenceObject,
    TableColumn,
    TableState,
} from "@eyeseetea/d2-ui-components";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { SynchronizationRule } from "../../../../../domain/rules/entities/SynchronizationRule";
import i18n from "../../../../../locales";
import DeletedObject from "../../../../../models/deletedObjects";
import { MetadataType } from "../../../../../utils/d2";
import { useAppContext } from "../../contexts/AppContext";

export interface DeletedObjectsTableProps {
    openSynchronizationDialog: () => void;
    syncRule: SynchronizationRule;
    onChange: (syncRule: SynchronizationRule) => void;
}

const DeletedObjectsTable: React.FC<DeletedObjectsTableProps> = ({ openSynchronizationDialog, syncRule, onChange }) => {
    const { api } = useAppContext();

    const [deletedObjectsRows, setDeletedObjectsRows] = useState<MetadataType[]>([]);
    const [search, setSearch] = useState<string | undefined>(undefined);
    const [dateFilter, setDateFilter] = useState<Date | null>(null);

    const deletedObjectsColumns: TableColumn<MetadataType>[] = [
        { name: "id", text: i18n.t("Identifier"), sortable: true },
        { name: "code", text: i18n.t("Code"), sortable: true },
        { name: "klass", text: i18n.t("Metadata type"), sortable: true },
        { name: "deletedAt", text: i18n.t("Deleted date"), sortable: true },
        { name: "deletedBy", text: i18n.t("Deleted by"), sortable: true },
    ];

    const deletedObjectsDetails: ObjectsTableDetailField<MetadataType>[] = [
        { name: "id", text: i18n.t("Identifier") },
        { name: "code", text: i18n.t("Code") },
        { name: "klass", text: i18n.t("Metadata type") },
        { name: "deletedAt", text: i18n.t("Deleted date") },
        { name: "deletedBy", text: i18n.t("Deleted by") },
    ];

    const deletedObjectsActions = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            type: "details",
        },
    ];

    useEffect(() => {
        DeletedObject.list(
            api,
            {
                search,
                lastUpdatedDate: dateFilter !== null ? moment(dateFilter).startOf("day") : undefined,
            },
            {}
        ).then(({ objects }) => setDeletedObjectsRows(objects));
    }, [api, search, dateFilter]);

    const handleTableChange = (tableState: TableState<ReferenceObject>) => {
        const { selection } = tableState;
        onChange(syncRule.updateMetadataIds(selection.map(({ id }) => id)));
    };

    const filterComponents = (
        <React.Fragment>
            <DatePicker
                placeholder={i18n.t("Deleted date")}
                value={dateFilter}
                onChange={setDateFilter}
                isFilter={true}
            />
        </React.Fragment>
    );

    return (
        <ObjectsTable<MetadataType>
            rows={deletedObjectsRows}
            columns={deletedObjectsColumns}
            details={deletedObjectsDetails}
            actions={deletedObjectsActions}
            forceSelectionColumn={true}
            onActionButtonClick={openSynchronizationDialog}
            onChange={handleTableChange}
            actionButtonLabel={<SyncIcon />}
            onChangeSearch={setSearch}
            searchBoxLabel={i18n.t("Search deleted objects")}
            filterComponents={filterComponents}
        />
    );
};

export default DeletedObjectsTable;
