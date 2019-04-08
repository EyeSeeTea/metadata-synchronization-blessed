import React from "react";
import BaseSyncConfigurator from "./BaseSyncConfigurator";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { DataElementModel } from "../../models/d2Model";

export default class DataElementSync extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        const title = i18n.t("Data Elements Synchronization");
        return <BaseSyncConfigurator model={DataElementModel} title={title} {...this.props} />;
    }
}
