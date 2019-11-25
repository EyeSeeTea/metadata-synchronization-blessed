import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";

import DataElementsSelectionStep from "./steps/DataElementsSelectionStep";
import OrganisationUnitsSelectionStep from "./steps/OrganisationUnitsSelectionStep";
import PeriodSelectionStep from "./steps/PeriodSelectionStep";
import CategoryOptionsSelectionStep from "./steps/CategoryOptionsSelectionStep";
import commonStepsBaseInfo from "../common/CommonStepsBaseInfo";
import GenericSyncRulesWizard from "../common/GenericSyncRulesWizard";

class DataSyncRulesWizard extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    stepsBaseInfo = [
        commonStepsBaseInfo.generalInfo,
        {
            key: "data-elements",
            label: i18n.t("Data elements"),
            component: DataElementsSelectionStep,
            validationKeys: ["dataElementIds"],
            description: undefined,
            help: undefined,
        },
        {
            key: "organisations-units",
            label: i18n.t("Organisation units"),
            component: OrganisationUnitsSelectionStep,
            validationKeys: ["dataSyncOrganisationUnits"],
            description: undefined,
            help: undefined,
        },
        {
            key: "period",
            label: i18n.t("Period"),
            component: PeriodSelectionStep,
            validationKeys: ["dataSyncStartDate", "dataSyncEndDate"],
            description: undefined,
            help: undefined,
        },
        {
            key: "category-options",
            label: i18n.t("Category options"),
            component: CategoryOptionsSelectionStep,
            validationKeys: ["categoryOptionIds"],
            description: undefined,
            help: undefined,
        },
        commonStepsBaseInfo.instanceSelection,
        commonStepsBaseInfo.scheduler,
        commonStepsBaseInfo.summary,
    ];

    render() {
        const { d2 } = this.props;
        const title = i18n.t("data synchronization rule");

        const type = "data";

        return (
            <GenericSyncRulesWizard
                syncTitle={title}
                stepsBaseInfo={this.stepsBaseInfo}
                d2={d2}
                type={type}
            />
        );
    }
}

export default withRouter(DataSyncRulesWizard);
