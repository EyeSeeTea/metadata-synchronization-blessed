import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import {
    DataElementGroupModel,
    DataElementGroupSetModel,
    DataElementModel,
    IndicatorGroupModel,
    IndicatorGroupSetModel,
    IndicatorModel,
    OrganisationUnitGroupModel,
    OrganisationUnitGroupSetModel,
    OrganisationUnitModel,
    ValidationRuleGroupModel,
    ValidationRuleModel,
} from "../../models/d2Model";
import GenericSynchronizationPage from "./GenericSynchronizationPage";

export default class MetadataPage extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    models = [
        DataElementModel,
        DataElementGroupModel,
        DataElementGroupSetModel,
        IndicatorModel,
        IndicatorGroupModel,
        IndicatorGroupSetModel,
        OrganisationUnitModel,
        OrganisationUnitGroupModel,
        OrganisationUnitGroupSetModel,
        ValidationRuleModel,
        ValidationRuleGroupModel,
    ];

    render() {
        const { d2 } = this.props;

        const title = i18n.t("Metadata Synchronization");

        return <GenericSynchronizationPage d2={d2} models={this.models} title={title} />;
    }
}
