import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";
import MetadataStep from "./steps/MetadataSelectionStep";
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
        const type = "metadata";

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

export default withRouter(MetadataSyncRulesWizard);
