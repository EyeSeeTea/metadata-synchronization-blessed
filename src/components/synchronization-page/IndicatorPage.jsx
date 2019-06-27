import React from "react";
import BaseSyncConfigurator from "./BaseSynchronizationPage";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { IndicatorModel } from "../../models/d2Model";

export default class IndicatorPage extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        const title = i18n.t("Indicators Synchronization");

        return (
            <BaseSyncConfigurator
                model={IndicatorModel}
                title={title}
                groupFilterName={"indicatorGroups"}
                {...this.props}
            />
        );
    }
}
