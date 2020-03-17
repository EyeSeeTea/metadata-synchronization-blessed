import i18n from "@dhis2/d2-i18n";
import { ObjectsTableDetailField, TableColumn } from "d2-ui-components";
import { MetadataType } from "../../utils/d2";

export const deletedObjectsColumns: TableColumn<MetadataType>[] = [
    { name: "id", text: i18n.t("Identifier"), sortable: true },
    { name: "code", text: i18n.t("Code"), sortable: true },
    { name: "klass", text: i18n.t("Metadata type"), sortable: true },
    { name: "deletedAt", text: i18n.t("Deleted date"), sortable: true },
    { name: "deletedBy", text: i18n.t("Deleted by"), sortable: true },
];

export const deletedObjectsDetails: ObjectsTableDetailField<MetadataType>[] = [
    { name: "id", text: i18n.t("Identifier") },
    { name: "code", text: i18n.t("Code") },
    { name: "klass", text: i18n.t("Metadata type") },
    { name: "deletedAt", text: i18n.t("Deleted date") },
    { name: "deletedBy", text: i18n.t("Deleted by") },
];

export const deletedObjectsActions = [
    {
        name: "details",
        text: i18n.t("Details"),
        multiple: false,
        type: "details",
    },
];
