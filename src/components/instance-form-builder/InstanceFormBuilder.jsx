import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";
import { ConfirmationDialog } from "d2-ui-components";

import Instance from "../../models/instance";

import PageHeader from "../shared/PageHeader";
import GeneralInfoForm from "./GeneralInfoForm";

class InstanceFormBuilder extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        appConfig: PropTypes.object.isRequired,
    };

    isEdit = this.props.match.params.formFor === "edit";

    constructor(props) {
        super(props);

        const {
            location,
            appConfig: { encryptionKey },
        } = props;

        const instance = Instance.getOrCreate(location.instance, encryptionKey);

        this.state = {
            instance,
            dialogOpen: false,
        };
    }

    componentDidMount = async () => {
        const {
            match: { params },
            appConfig: { encryptionKey },
            d2,
        } = this.props;
        const { instance } = this.state;
        if (this.isEdit && !instance.data.id) {
            const encryptedInstance = await Instance.get(d2, params.id);
            const instanceToEdit = encryptedInstance.decryptPassword(encryptionKey);
            this.setState({ instance: instanceToEdit });
        }
    };

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
        const { d2, appConfig } = this.props;

        const title = !this.isEdit ? i18n.t("New Instance") : i18n.t("Edit Instance");

        const cancel = !this.isEdit
            ? i18n.t("Cancel Instance Creation")
            : i18n.t("Cancel Instance Editing");

        return (
            <React.Fragment>
                <ConfirmationDialog
                    isOpen={dialogOpen}
                    onSave={this.handleConfirm}
                    onCancel={this.handleDialogCancel}
                    title={cancel}
                    description={i18n.t("All your changes will be lost. Are you sure?")}
                    saveText={i18n.t("Ok")}
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
