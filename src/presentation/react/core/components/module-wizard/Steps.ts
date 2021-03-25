import { WizardStep } from "@eyeseetea/d2-ui-components";
import { Module } from "../../../../../domain/modules/entities/Module";
import i18n from "../../../../../locales";
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
    isEdit: boolean;
}

const commonSteps: {
    [key: string]: SyncWizardStep;
} = {
    generalInfo: {
        key: "general-info",
        label: i18n.t("General info"),
        component: GeneralInfoStep,
        validationKeys: ["name", "department"],
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
        key: "dependencies-selection",
        label: i18n.t("Select dependencies"),
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
