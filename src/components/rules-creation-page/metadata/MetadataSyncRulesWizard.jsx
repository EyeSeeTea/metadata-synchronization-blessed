import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";
import { ConfirmationDialog, Wizard } from "d2-ui-components";

import PageHeader from "../../page-header/PageHeader";
import GeneralInfoStep from "../common/steps/GeneralInfoStep";
import SyncRule from "../../../models/syncRule";
import MetadataStep from "./steps/MetadataSelectionStep";
import InstanceSelectionStep from "../common/steps/InstanceSelectionStep";
import SchedulerStep from "../common/steps/SchedulerStep";
import SaveStep from "../common/steps/SaveStep";
import { getValidationMessages } from "../../../utils/validations";
import commonStepsBaseInfo from "../common/CommonStepsBaseInfo";
import GenericSyncRulesWizard from "../common/GenericSyncRulesWizard";

class MetadataSyncRulesWizard extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    stepsBaseInfo = [
        commonStepsBaseInfo.generalInfo,
        {
            key: "metadata",
            label: i18n.t("Metadata"),
            component: MetadataStep,
            validationKeys: ["metadataIds"],
            description: undefined,
            help: undefined,
        },
        commonStepsBaseInfo.instanceSelection,
        commonStepsBaseInfo.scheduler,
        commonStepsBaseInfo.summary,
    ];

    render() {
        const { d2 } = this.props;
        const title = i18n.t("metadata synchronization rule");

        return (
            <GenericSyncRulesWizard syncTitle={title} stepsBaseInfo={this.stepsBaseInfo} d2={d2} />
        );
    }
}

export default withRouter(MetadataSyncRulesWizard);
