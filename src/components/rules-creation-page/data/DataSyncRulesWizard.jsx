import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";
import { ConfirmationDialog, Wizard } from "d2-ui-components";

import PageHeader from "../../page-header/PageHeader";
import GeneralInfoStep from "../common/steps/GeneralInfoStep";
import SyncRule from "../../../models/syncRule";
import InstanceSelectionStep from "../common/steps/InstanceSelectionStep";
import SchedulerStep from "../common/steps/SchedulerStep";
import SaveStep from "../common/steps/SaveStep";
import { getValidationMessages } from "../../../utils/validations";
import DataElementsSelectionStep from "./steps/DataElementsSelectionStep";
import OrganisationUnitsSelectionStep from "./steps/OrganisationUnitsSelectionStep";
import PeriodSelectionStep from "./steps/PeriodSelectionStep";
import CategoryOptionsSelectionStep from "./steps/CategoryOptionsSelectionStep";

class DataSyncRulesWizard extends React.Component {
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
            key: "data-elements",
            label: i18n.t("Data elements"),
            component: DataElementsSelectionStep,
            validationKeys: ["dataElementIds"],
            description: undefined,
            help: undefined,
        },
        {
            key: "organisations-units",
            label: i18n.t("Organisation units"),
            component: OrganisationUnitsSelectionStep,
            validationKeys: ["organisationUnitIds"],
            description: undefined,
            help: undefined,
        },
        {
            key: "period",
            label: i18n.t("Period"),
            component: PeriodSelectionStep,
            validationKeys: ["period"],
            description: undefined,
            help: undefined,
        },
        {
            key: "category-options",
            label: i18n.t("Category options"),
            component: CategoryOptionsSelectionStep,
            validationKeys: ["categoryOptionIds"],
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
            key: "scheduler",
            label: i18n.t("Scheduling"),
            component: SchedulerStep,
            validationKeys: ["frequency", "enabled"],
            description: i18n.t("Configure the scheduling frequency for the synchronization rule"),
            warning: i18n.t(
                "This step is optional and requires an external server with the metadata synchronization script properly configured"
            ),
            help: [
                i18n.t(
                    "This step allows to schedule background metadata synchronization jobs in a remote server."
                ),
                i18n.t(
                    "You can either select a pre-defined frequency from the drop-down menu or you enter a custom cron expression."
                ),
                "A cron expression is a string comprising six fields separated by white space that represents a routine.",
                i18n.t("Second (0 - 59)"),
                i18n.t("Minute (0 - 59)"),
                i18n.t("Hour (0 - 23)"),
                i18n.t("Day of the month (1 - 31)"),
                i18n.t("Month (1 - 12)"),
                i18n.t("Day of the week (1 - 7) (Monday to Sunday)"),
                i18n.t(
                    "An asterisk (*) matches all possibilities. For instance, if we want to run a rule every day we would use asterisks for day of the month, day of the week, and month of the year to match all values."
                ),
                i18n.t(
                    "A wildcard (?) means no specific value and only works for day of the month or day of the week. For example, if you want to execute a rule on a particular day (10th) but you don't care about what day of the week that is, you would use ? in the day of the week field."
                ),
            ].join("\n"),
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
        this.props.history.push("/data-synchronization-rules");
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

        const steps = DataSyncRulesWizard.getStepsBaseInfo.map(step => ({
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

export default withRouter(DataSyncRulesWizard);
