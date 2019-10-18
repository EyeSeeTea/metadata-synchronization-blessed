import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { metadataModels } from "../../models/d2Model";
import GenericSynchronizationPage from "./GenericSynchronizationPage";

export default class DataPage extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        const { d2 } = this.props;

        const title = i18n.t("Data Synchronization");

        return <GenericSynchronizationPage d2={d2} models={metadataModels} title={title} />;
    }
}