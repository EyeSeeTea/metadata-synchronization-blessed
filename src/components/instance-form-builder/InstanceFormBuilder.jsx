import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";

import Instance from "../../models/instance";

import PageHeader from "../shared/PageHeader";
import GeneralInfoForm from "./GeneralInfoForm";
import ConfirmationDialog from "../confirmation-dialog/ConfirmationDialog";

class InstanceFormBuilder extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        appConfig: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        const isEdit = props.location.instance !== undefined;
        let instance;
        if (isEdit) {
            const cryptedInstance = new Instance(props.location.instance);
            instance = cryptedInstance.decryptPassword(props.appConfig.encryptionKey);
        } else {
            instance = Instance.create();
        }

        this.state = {
            instance,
            isEdit,
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
        const { dialogOpen, isEdit } = this.state;
        const { d2, appConfig } = this.props;

        const title = !isEdit ? i18n.t("New Instance") : i18n.t("Edit Instance");

        const cancel = !isEdit
            ? i18n.t("Cancel Instance Creation")
            : i18n.t("Cancel Instance Editing");

        return (
            <React.Fragment>
                <ConfirmationDialog
                    dialogOpen={dialogOpen}
                    handleConfirm={this.handleConfirm}
                    handleCancel={this.handleDialogCancel}
                    title={cancel}
                    contents={i18n.t("All your changes will be lost. Are you sure?")}
                />

                <PageHeader
                    title={title}
                    onBackClick={this.cancelSave}
                    helpText={i18n.t("Help text")}
                />

                <GeneralInfoForm
                    d2={d2}
                    appConfig={appConfig}
                    instance={this.state.instance}
                    onChange={this.onChange}
                    cancelAction={this.cancelSave}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(InstanceFormBuilder);
