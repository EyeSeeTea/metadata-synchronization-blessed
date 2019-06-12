import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";
import { ConfirmationDialog, Wizard } from "d2-ui-components";

import Instance from "../../models/instance";

import PageHeader from "../page-header/PageHeader";

class SyncRulesWizard extends React.Component {
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

    static getStepsBaseInfo() {
        return [
            {
                key: "general-info",
                label: i18n.t("General info"),
                component: () => <p>Test</p>,
                validationKeys: [],
                description: i18n.t(`Description`),
                help: i18n.t(`Help`),
            },
        ];
    }

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
        this.props.history.push("/synchronization-rules");
    };

    handleDialogCancel = () => {
        this.setState({ dialogOpen: false });
    };

    onChange = instance => {
        this.setState({ instance });
    };

    switchStep = () => {};

    render() {
        const { dialogOpen, instance } = this.state;
        const { d2 } = this.props;

        const title = !this.isEdit ? i18n.t("New Sync Rule") : i18n.t("Edit Sync Rule");

        const cancel = !this.isEdit
            ? i18n.t("Cancel Sync Rule Creation")
            : i18n.t("Cancel Sync Rule Editing");

        const steps = SyncRulesWizard.getStepsBaseInfo().map(step => ({
            ...step,
            props: {
                d2,
                instance,
                //onChange: this.onChange(step),
                onCancel: this.handleConfirm,
            },
        }));

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

                <Wizard
                    onStepChangeRequest={this.switchStep}
                    initialStepKey={steps[0].key}
                    steps={steps}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(SyncRulesWizard);
