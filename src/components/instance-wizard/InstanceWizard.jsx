import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";

import Instance from "../../models/instance";

import FormHeading from "./FormHeading";
import GeneralInfoStep from "./GeneralInfoForm";
import ConfirmationDialog from "../confirmation-dialog/ConfirmationDialog";

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

    render() {
        const { dialogOpen } = this.state;
        const { d2 } = this.props;

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

                <FormHeading
                    title={i18n.t("New Instance")}
                    onBackClick={this.cancelSave}
                />

                <GeneralInfoStep
                    d2={d2}
                    instance={this.state.instance}
                    onChange={this.onChange}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(InstanceWizard);
