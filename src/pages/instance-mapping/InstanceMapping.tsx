import i18n from "@dhis2/d2-i18n";
import React from "react";
import { useHistory } from "react-router-dom";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import PageHeader from "../../components/page-header/PageHeader";
import { D2Model, OrganisationUnitModel } from "../../models/d2Model";

/** TODO: Model
interface MetadataMapping {
    id: string;
    instance: string;
    metadataType: keyof D2ModelSchemas;
    originalId: string;
    mappedId: string;
}
*/

const models: typeof D2Model[] = [OrganisationUnitModel];

const InstanceMappingPage: React.FC = () => {
    const history = useHistory();

    const backHome = () => {
        history.push("/");
    };

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Metadata mapping")} onBackClick={backHome} />

            <MetadataTable models={models} />
        </React.Fragment>
    );
};

export default InstanceMappingPage;
