import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";
import { ConfirmationDialog, Wizard } from "d2-ui-components";

import PageHeader from "../../page-header/PageHeader";
import GeneralInfoStep from "../common/steps/GeneralInfoStep";
import SyncRule from "../../../models/syncRule";
import { getValidationMessages } from "../../../utils/validations";

class GenericSyncRulesWizard extends React.Component {
    static propTypes = {
        syncTitle: PropTypes.string.isRequired,
        stepsBaseInfo: PropTypes.object.isRequired,
        d2: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    state = {
        dialogOpen: false,
        syncRule: SyncRule.create(),
    };

    id = this.props.match.params.id;
    isEdit = this.props.match.params.action === "edit" && this.id;

    componentDidMount = async () => {
        if (this.isEdit) {
            const syncRule = await SyncRule.get(this.props.d2, this.id);
            this.setState({ syncRule });
        }
    };

    cancelSave = () => {
        this.setState({ dialogOpen: true });
    };

    handleConfirm = () => {
        this.setState({ dialogOpen: false });
        this.props.history.goBack();
    };

    handleDialogCancel = () => {
        this.setState({ dialogOpen: false });
    };

    onChange = syncRule => {
        this.setState({ syncRule });
    };

    onStepChangeRequest = async currentStep => {
        return getValidationMessages(
            this.props.d2,
            this.state.syncRule,
            currentStep.validationKeys
        );
    };

    render() {
        const { dialogOpen, syncRule } = this.state;
        const { d2, location, stepsBaseInfo, syncTitle } = this.props;

        const title = !this.isEdit
            ? i18n.t(`New ${syncTitle}`)
            : i18n.t(`Edit ${syncTitle}`);

        const cancel = !this.isEdit
            ? i18n.t(`Cancel ${syncTitle} creation`)
            : i18n.t(`Cancel ${syncTitle} editing`);

        const steps = stepsBaseInfo.map(step => ({
            ...step,
            props: {
                d2,
                syncRule,
                onCancel: this.handleConfirm,
                onChange: this.onChange,
            },
        }));

        const urlHash = location.hash.slice(1);
        const stepExists = steps.find(step => step.key === urlHash);
        const firstStepKey = steps.map(step => step.key)[0];
        const initialStepKey = stepExists ? urlHash : firstStepKey;
        const lastClickableStepIndex = this.isEdit ? steps.length - 1 : 0;

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

                <PageHeader title={title} onBackClick={this.cancelSave} />

                <Wizard
                    useSnackFeedback={true}
                    onStepChangeRequest={this.onStepChangeRequest}
                    initialStepKey={initialStepKey}
                    lastClickableStepIndex={lastClickableStepIndex}
                    steps={steps}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(GenericSyncRulesWizard);
