import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";

import Instance from "../../models/instance";

import Wizard from "../wizard/Wizard";
import FormHeading from "./FormHeading";
import SaveStep from "./save/SaveStep";
import GeneralInfoStep from "./general-info/GeneralInfoStep";
import ConfirmationDialog from "../confirmation-dialog/ConfirmationDialog";

import { getValidationMessages } from "../../utils/validations";

const stepsBaseInfo = [
    {
        key: "general-info",
        label: i18n.t("General info"),
        component: GeneralInfoStep,
        validationKeys: ["name", "url", "username", "password"],
        help: i18n.t("Insert the details required to configure a new instance"),
    },
    {
        key: "save",
        label: i18n.t("Save"),
        component: SaveStep,
        validationKeys: [],
        help: i18n.t("Press the button to create the instance"),
    },
];

class InstanceWizard extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            instance: Instance.create(),
            dialogOpen: false,
        };
    }

    cancelSave = () => {
        this.setState({ dialogOpen: true });
    };

    handleConfirm = () => {
        this.setState({ dialogOpen: false });
        this.props.history.push("/instance-configurator");
    };

    handleDialogCancel = () => {
        this.setState({ dialogOpen: false });
    };

    onChange = instance => {
        this.setState({ instance });
    };

    onStepChangeRequest = currentStep => {
        return getValidationMessages(this.state.instance, currentStep.validationKeys);
    };

    render() {
        const { d2, location } = this.props;
        const { instance, dialogOpen } = this.state;

        const steps = stepsBaseInfo.map(step => ({
            ...step,
            props: {
                d2,
                instance,
                onChange: this.onChange,
            },
        }));

        const urlHash = location.hash.slice(1);
        const stepExists = steps.find(step => step.key === urlHash);
        const firstStepKey = steps.map(step => step.key)[0];
        const initialStepKey = stepExists ? urlHash : firstStepKey;

        return (
            <React.Fragment>
                <ConfirmationDialog
                    dialogOpen={dialogOpen}
                    handleConfirm={this.handleConfirm}
                    handleCancel={this.handleDialogCancel}
                    title={i18n.t("Cancel Instance Creation?")}
                    contents={i18n.t(
                        "You are about to exit the instance creation wizard. All your changes will be lost. Are you sure?"
                    )}
                />
                <FormHeading title={i18n.t("New Instance")} onBackClick={this.cancelSave} />

                <Wizard
                    steps={steps}
                    initialStepKey={initialStepKey}
                    useSnackFeedback={true}
                    onStepChangeRequest={this.onStepChangeRequest}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(InstanceWizard);
