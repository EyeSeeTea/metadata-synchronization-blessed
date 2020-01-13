import i18n from "@dhis2/d2-i18n";
import { ObjectsTable } from "d2-ui-components";
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
    [key: string]: any;
}

const InstanceMappingPage: React.FC = () => {
    const history = useHistory();

    const backHome = () => {
        history.push("/");
    };

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Metadata mapping")} onBackClick={backHome} />
            <ObjectsTable<MetadataMapping>
                rows={[]}
                columns={[]}
                details={[]}
                actions={[]}
            />
        </React.Fragment>
    );
};

export default InstanceMappingPage;
