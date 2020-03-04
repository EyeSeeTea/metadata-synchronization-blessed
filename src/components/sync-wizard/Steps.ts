import i18n from "@dhis2/d2-i18n";
import { WizardStep } from "d2-ui-components";
import SyncRule from "../../models/syncRule";
import GeneralInfoStep from "./common/GeneralInfoStep";
import InstanceSelectionStep from "./common/InstanceSelectionStep";
import MetadataSelectionStep from "./common/MetadataSelectionStep";
import SchedulerStep from "./common/SchedulerStep";
import SummaryStep from "./common/SummaryStep";
import CategoryOptionsSelectionStep from "./data/CategoryOptionsSelectionStep";
import EventsSelectionStep from "./data/EventsSelectionStep";
import OrganisationUnitsSelectionStep from "./data/OrganisationUnitsSelectionStep";
import PeriodSelectionStep from "./data/PeriodSelectionStep";
import MetadataIncludeExcludeStep from "./metadata/MetadataIncludeExcludeStep";

export interface SyncWizardStep extends WizardStep {
    validationKeys: string[];
    showOnSyncDialog?: boolean;
}

export interface SyncWizardStepProps {
    syncRule: SyncRule;
    onChange: (syncRule: SyncRule) => void;
    onCancel: () => void;
}

const commonSteps: {
    [key: string]: SyncWizardStep;
} = {
    generalInfo: {
        key: "general-info",
        label: i18n.t("General info"),
        component: GeneralInfoStep,
        validationKeys: ["name"],
    },
    instanceSelection: {
        key: "instance-selection",
        label: i18n.t("Instance Selection"),
        component: InstanceSelectionStep,
        validationKeys: ["targetInstances"],
        showOnSyncDialog: true,
    },
    scheduler: {
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
    summary: {
        key: "summary",
        label: i18n.t("Summary"),
        component: SummaryStep,
        validationKeys: [],
        showOnSyncDialog: true,
    },
};

export const metadataSteps: SyncWizardStep[] = [
    commonSteps.generalInfo,
    {
        key: "metadata",
        label: i18n.t("Metadata"),
        component: MetadataSelectionStep,
        validationKeys: ["metadataIds"],
    },
    {
        key: "include-exclude-selection",
        label: i18n.t("Include Exclude Selection"),
        component: MetadataIncludeExcludeStep,
        validationKeys: ["metadataIncludeExclude"],
        description: undefined,
        help: undefined,
        showOnSyncDialog: true,
    },
    commonSteps.instanceSelection,
    commonSteps.scheduler,
    commonSteps.summary,
];

export const aggregatedSteps: SyncWizardStep[] = [
    commonSteps.generalInfo,
    {
        key: "data-elements",
        label: i18n.t("Data elements"),
        component: MetadataSelectionStep,
        validationKeys: ["metadataIds"],
        showOnSyncDialog: false,
    },
    {
        key: "organisations-units",
        label: i18n.t("Organisation units"),
        component: OrganisationUnitsSelectionStep,
        validationKeys: ["dataSyncOrganisationUnits"],
        showOnSyncDialog: true,
    },
    {
        key: "period",
        label: i18n.t("Period"),
        component: PeriodSelectionStep,
        validationKeys: ["dataSyncStartDate", "dataSyncEndDate"],
        showOnSyncDialog: true,
    },
    {
        key: "category-options",
        label: i18n.t("Category options"),
        component: CategoryOptionsSelectionStep,
        validationKeys: ["categoryOptionIds"],
        showOnSyncDialog: true,
    },
    commonSteps.instanceSelection,
    commonSteps.scheduler,
    commonSteps.summary,
];

export const eventsSteps: SyncWizardStep[] = [
    commonSteps.generalInfo,
    {
        key: "organisations-units",
        label: i18n.t("Organisation units"),
        component: OrganisationUnitsSelectionStep,
        validationKeys: ["dataSyncOrganisationUnits"],
        showOnSyncDialog: true,
    },
    {
        key: "programs",
        label: i18n.t("Programs"),
        component: MetadataSelectionStep,
        validationKeys: ["metadataIds"],
        showOnSyncDialog: false,
    },
    {
        key: "period",
        label: i18n.t("Period"),
        component: PeriodSelectionStep,
        validationKeys: ["dataSyncStartDate", "dataSyncEndDate"],
        showOnSyncDialog: true,
    },
    {
        key: "events",
        label: i18n.t("Events"),
        component: EventsSelectionStep,
        validationKeys: ["dataSyncEvents"],
        showOnSyncDialog: true,
    },
    commonSteps.instanceSelection,
    commonSteps.scheduler,
    commonSteps.summary,
];
