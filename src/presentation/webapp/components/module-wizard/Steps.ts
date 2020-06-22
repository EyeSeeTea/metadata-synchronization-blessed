import i18n from "@dhis2/d2-i18n";
import { WizardStep } from "d2-ui-components";
import { Module } from "../../../../domain/modules/entities/Module";
import { GeneralInfoStep } from "./common/GeneralInfoStep";
import { MetadataSelectionStep } from "./common/MetadataSelectionStep";
import { SummaryStep } from "./common/SummaryStep";
import { AdvancedMetadataOptionsStep } from "./metadata/AdvancedMetadataOptionsStep";
import { MetadataIncludeExcludeStep } from "./metadata/MetadataIncludeExcludeStep";

export interface SyncWizardStep extends WizardStep {
    validationKeys: string[];
    showOnSyncDialog?: boolean;
}

export interface ModuleWizardStepProps<T extends Module = Module> {
    module: T;
    onChange: (module: T) => void;
    onCancel: () => void;
    onClose: () => void;
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
    summary: {
        key: "summary",
        label: i18n.t("Summary"),
        component: SummaryStep,
        validationKeys: [],
        showOnSyncDialog: true,
    },
};

export const metadataModuleSteps: SyncWizardStep[] = [
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
    },
    {
        key: "advanced-metadata-options",
        label: i18n.t("Advanced options"),
        component: AdvancedMetadataOptionsStep,
        validationKeys: [],
    },
    commonSteps.summary,
];
