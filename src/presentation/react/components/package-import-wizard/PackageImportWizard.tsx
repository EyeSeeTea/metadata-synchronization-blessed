import { Wizard, WizardStep } from "d2-ui-components";
import React from "react";
import { useLocation } from "react-router-dom";
import { PackageImportRule } from "../../../../domain/package-import/entities/PackageImportRule";
import i18n from "../../../../locales";
import { PackageSelectionStep } from "./steps/PackageSelectionStep";
import { SummaryStep } from "./steps/SummaryStep";

export interface PackageImportWizardStep extends WizardStep {
    validationKeys: string[];
}

export interface PackageImportWizardStepProps {
    packageImportRule: PackageImportRule;
    onChange: (packageImportRule: PackageImportRule) => void;
    onCancel: () => void;
    onClose: () => void;
}

const GeneralInfoStep = () => <div>General info</div>;
const PackagesMetadataStep = () => <div>Packages</div>;

export const stepsBaseInfo = [
    {
        key: "general-info",
        label: i18n.t("General info"),
        component: GeneralInfoStep,
        validationKeys: [],
    },
    {
        key: "packages",
        label: i18n.t("Packages"),
        component: PackageSelectionStep,
        validationKeys: ["packageIds"],
    },
    {
        key: "package-mapping",
        label: i18n.t("Packages mapping"),
        component: PackagesMetadataStep,
        validationKeys: [],
    },
    {
        key: "summary",
        label: i18n.t("Summary"),
        component: SummaryStep,
        validationKeys: [],
    },
];

export interface PackageImportWizardProps {
    packageImportRule: PackageImportRule;
    onChange: (packageImportRule: PackageImportRule) => void;
    onCancel: () => void;
    onClose: () => void;
}

export const PackageImportWizard: React.FC<PackageImportWizardProps> = props => {
    const location = useLocation();

    const steps = stepsBaseInfo.map(step => ({ ...step, props }));

    const onStepChangeRequest = async (currentStep: WizardStep, _newStep: WizardStep) => {
        const step = currentStep as PackageImportWizardStep;

        const errors = props.packageImportRule
            .validate(step.validationKeys)
            .map(({ description }) => description);

        return errors;
    };

    const urlHash = location.hash.slice(1);
    const stepExists = steps.find(step => step.key === urlHash);
    const firstStepKey = steps.map(step => step.key)[0];
    const initialStepKey = stepExists ? urlHash : firstStepKey;

    return (
        <Wizard
            useSnackFeedback={true}
            onStepChangeRequest={onStepChangeRequest}
            initialStepKey={initialStepKey}
            lastClickableStepIndex={steps.length - 1}
            steps={steps}
        />
    );
};
