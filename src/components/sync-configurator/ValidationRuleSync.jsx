import React from "react";
import BaseSyncConfigurator from "./BaseSyncConfigurator";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { ValidationRuleModel } from "../../models/d2Model";

export default class ValidationRuleSync extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };
    
    render() {
        const { d2 } = this.props;
        const title = i18n.t("Validation Rules Synchronization");

        return <BaseSyncConfigurator d2={d2} model={ValidationRuleModel} title={title} />;
    }
}
