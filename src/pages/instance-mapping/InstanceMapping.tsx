import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, TableColumn, ObjectsTableDetailField, TableAction } from "d2-ui-components";
import React from "react";
import { useHistory } from "react-router-dom";
import PageHeader from "../../components/page-header/PageHeader";
import { D2ModelSchemas } from "d2-api";

interface MetadataMapping {
    id: string;
    instance: string;
    metadataType: keyof D2ModelSchemas;
    originalId: string;
    mappedId: string;
}

const InstanceMappingPage: React.FC = () => {
    const history = useHistory();

    const columns: TableColumn<MetadataMapping>[] = [
        { name: "originalId" as const, text: i18n.t("UID"), sortable: true },
        { name: "instance" as const, text: i18n.t("Instance"), sortable: true },
        { name: "metadataType" as const, text: i18n.t("Metadata type"), sortable: true },
        { name: "mappedId" as const, text: i18n.t("Mapped UID"), sortable: true },
    ];

    const details: ObjectsTableDetailField<MetadataMapping>[] = [];

    const actions: TableAction<MetadataMapping>[] = [];

    const backHome = () => {
        history.push("/");
    };

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Metadata mapping")} onBackClick={backHome} />
            <ObjectsTable<MetadataMapping>
                rows={[]}
                columns={columns}
                details={details}
                actions={actions}
            />
        </React.Fragment>
    );
};

export default InstanceMappingPage;
