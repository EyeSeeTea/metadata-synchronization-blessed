import React from "react";
import BaseSyncConfigurator from "./BaseSynchronizationPage";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { ValidationRuleModel } from "../../models/d2Model";

export default class ValidationRulePage extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        const title = i18n.t("Validation Rules Synchronization");

        return (
            <BaseSyncConfigurator
                model={ValidationRuleModel}
                title={title}
                groupFilterName={"validationRuleGroups"}
                {...this.props}
            />
        );
    }
}
