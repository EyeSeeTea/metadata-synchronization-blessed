import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";
import { ConfirmationDialog, Wizard } from "d2-ui-components";

import PageHeader from "../page-header/PageHeader";
import GeneralInfoStep from "./steps/GeneralInfoStep";
import SyncRule from "../../models/syncRule";
import MetadataStep from "./steps/MetadataSelectionStep";
import InstanceSelectionStep from "./steps/InstanceSelectionStep";
import SaveStep from "./steps/SaveStep";
import { getValidationMessages } from "../../utils/validations";

class SyncRulesWizard extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    static getStepsBaseInfo = [
        {
            key: "general-info",
            label: i18n.t("General info"),
            component: GeneralInfoStep,
            validationKeys: ["name"],
            description: undefined,
            help: undefined,
        },
        {
            key: "metadata",
            label: i18n.t("Metadata"),
            component: MetadataStep,
            validationKeys: ["selectedIds"],
            description: undefined,
            help: undefined,
        },
        {
            key: "instance-selection",
            label: i18n.t("Instance Selection"),
            component: InstanceSelectionStep,
            validationKeys: ["targetInstances"],
            description: undefined,
            help: undefined,
        },
        {
            key: "summary",
            label: i18n.t("Summary"),
            component: SaveStep,
            validationKeys: [],
            description: undefined,
            help: undefined,
        },
    ];

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
        this.props.history.push("/synchronization-rules");
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
        const { d2, location } = this.props;

        const title = !this.isEdit
            ? i18n.t("New synchronization rule")
            : i18n.t("Edit synchronization rule");

        const cancel = !this.isEdit
            ? i18n.t("Cancel synchronization rule creation")
            : i18n.t("Cancel synchronization rule editing");

        const steps = SyncRulesWizard.getStepsBaseInfo.map(step => ({
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

export default withRouter(SyncRulesWizard);
