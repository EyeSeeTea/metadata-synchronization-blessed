import i18n from "@dhis2/d2-i18n";
import { ApiContext } from "d2-api";
import { ConfirmationDialog } from "d2-ui-components";
import PropTypes from "prop-types";
import React from "react";
import { withRouter } from "react-router-dom";
import PageHeader from "../../components/page-header/PageHeader";
import { TestWrapper } from "../../components/test-wrapper/TestWrapper";
import Instance from "../../models/instance";
import GeneralInfoForm from "./GeneralInfoForm";

class InstanceCreationPage extends React.Component {
    static contextType = ApiContext;
    static propTypes = {
        history: PropTypes.object.isRequired,
    };

    state = {
        dialogOpen: false,
        instance: Instance.create(),
    };

    id = this.props.match.params.id;
    isEdit = this.props.match.params.action === "edit" && this.id;

    componentDidMount = async () => {
        const { instance: stateInstance } = this.props.location.state ?? {};
        if (this.isEdit) {
            const instance = await Instance.get(this.context.api, this.id);
            this.setState({ instance });
        } else if (stateInstance) {
            this.setState({ instance: stateInstance });
        }
    };

    cancelSave = () => {
        this.setState({ dialogOpen: true });
    };

    handleConfirm = () => {
        this.setState({ dialogOpen: false });
        this.props.history.push("/instances");
    };

    handleDialogCancel = () => {
        this.setState({ dialogOpen: false });
    };

    onChange = instance => {
        this.setState({ instance });
    };

    render() {
        const { dialogOpen, instance } = this.state;

        const title = !this.isEdit ? i18n.t("New Instance") : i18n.t("Edit Instance");

        const cancel = !this.isEdit
            ? i18n.t("Cancel Instance Creation")
            : i18n.t("Cancel Instance Editing");

        return (
            <TestWrapper>
                <ConfirmationDialog
                    isOpen={dialogOpen}
                    onSave={this.handleConfirm}
                    onCancel={this.handleDialogCancel}
                    title={cancel}
                    description={i18n.t("All your changes will be lost. Are you sure?")}
                    saveText={i18n.t("Ok")}
                />

                <PageHeader title={title} onBackClick={this.cancelSave} helpText={undefined} />

                <GeneralInfoForm
                    instance={instance}
                    onChange={this.onChange}
                    cancelAction={this.cancelSave}
                />
            </TestWrapper>
        );
    }
}

export default withRouter(InstanceCreationPage);
