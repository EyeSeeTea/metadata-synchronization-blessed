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
    };

    state = {
        dialogOpen: false,
        instance: Instance.create(),
    };

    id = this.props.match.params.id;
    isEdit = this.props.match.params.action === "edit" && this.id;

    componentDidMount = async () => {
        if (this.isEdit) {
            const instance = await Instance.get(this.props.d2, this.id);
            this.setState({ instance });
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
        const { dialogOpen, instance } = this.state;
        const { d2 } = this.props;

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
                    instance={instance}
                    onChange={this.onChange}
                    cancelAction={this.cancelSave}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(InstanceFormBuilder);
