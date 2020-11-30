import { Wizard, WizardStep } from "d2-ui-components";
import _ from "lodash";
import React from "react";
import { useLocation } from "react-router-dom";
import { PackageImportRule } from "../../../../domain/package-import/entities/PackageImportRule";
import i18n from "../../../../locales";
import { InstanceStoreSelectionStep } from "./steps/InstanceStoreSelectionStep";
import { PackageMappingStep } from "./steps/PackageMappingStep";
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

export const stepsBaseInfo = [
    {
        key: "instance-playstore",
        label: i18n.t("Instances & Play Stores"),
        component: InstanceStoreSelectionStep,
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
        component: PackageMappingStep,
        validationKeys: [],
    },
    {
        key: "summary",
        label: i18n.t("Summary"),
        component: SummaryStep,
        validationKeys: [],
    },
];

const stepsRelatedToPackageSelection = ["instance-playstore", "packages"];

export interface PackageImportWizardProps {
    packageImportRule: PackageImportRule;
    onChange: (packageImportRule: PackageImportRule) => void;
    onCancel: () => void;
    onClose: () => void;
    disablePackageSelection?: boolean;
}

export const PackageImportWizard: React.FC<PackageImportWizardProps> = props => {
    const location = useLocation();

    const steps = stepsBaseInfo
        .filter(
            step =>
                !props.disablePackageSelection ||
                (props.disablePackageSelection &&
                    !stepsRelatedToPackageSelection.includes(step.key))
        )
        .map(step => ({ ...step, props }));

    const onStepChangeRequest = async (_currentStep: WizardStep, newStep: WizardStep) => {
        const index = _(steps).findIndex(step => step.key === newStep.key);
        const validationMessages = _.take(steps, index).map(({ validationKeys }) =>
            props.packageImportRule.validate(validationKeys).map(({ description }) => description)
        );

        return _.flatten(validationMessages);
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
