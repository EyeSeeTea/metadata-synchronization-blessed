import React from "react";
import i18n from "@dhis2/d2-i18n";
import GenericSynchronizationPage from "./GenericSynchronizationPage";
import {
    AggregatedDataElementModel,
    DataElementGroupModel,
    DataElementGroupSetModel,
    DataSetModel,
} from "../../models/d2Model";

export default class MetadataPage extends React.Component {
    render() {
        const title = i18n.t("Data Synchronization");

        return (
            <GenericSynchronizationPage
                models={[
                    AggregatedDataElementModel,
                    DataElementGroupModel,
                    DataElementGroupSetModel,
                    DataSetModel,
                ]}
                title={title}
            />
        );
    }
}
