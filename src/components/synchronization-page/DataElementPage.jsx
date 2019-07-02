import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { DataElementModel } from "../../models/d2Model";
import GenericSynchronizationPage from "./GenericSynchronizationPage";

export default class DataElementPage extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        const { d2 } = this.props;

        const title = i18n.t("Data Elements Synchronization");

        return <GenericSynchronizationPage d2={d2} models={[DataElementModel]} title={title} />;
    }
}
