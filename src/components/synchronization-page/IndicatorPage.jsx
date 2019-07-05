import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { IndicatorGroupModel, IndicatorGroupSetModel, IndicatorModel } from "../../models/d2Model";
import GenericSynchronizationPage from "./GenericSynchronizationPage";

export default class IndicatorPage extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    models = [IndicatorModel, IndicatorGroupModel, IndicatorGroupSetModel];

    render() {
        const { d2 } = this.props;

        const title = i18n.t("Indicators Synchronization");

        return <GenericSynchronizationPage d2={d2} models={this.models} title={title} />;
    }
}
