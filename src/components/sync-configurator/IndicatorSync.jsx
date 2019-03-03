import React from "react";
import BaseSyncConfigurator from "./BaseSyncConfigurator";
import PropTypes from "prop-types";
import { IndicatorModel } from "../../models/d2Model";

export default class IndicatorSync extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        const { d2 } = this.props;

        return <BaseSyncConfigurator d2={d2} model={IndicatorModel} />;
    }
}
