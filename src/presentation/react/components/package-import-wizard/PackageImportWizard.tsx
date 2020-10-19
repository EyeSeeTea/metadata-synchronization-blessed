import { Wizard, WizardStep } from "d2-ui-components";
import React from "react";
import { useLocation } from "react-router-dom";
import i18n from "../../../../locales";

const GeneralInfoStep = () => <div>General info</div>;
const PackagesStep = () => <div>Packages</div>;
const PackagesMetadataStep = () => <div>Packages</div>;
const SummaryStep = () => <div>Summary</div>;

export const stepsBaseInfo = [
    {
        key: "general-info",
        label: i18n.t("General info"),
        component: GeneralInfoStep,
        validationKeys: ["name", "department"],
    },
    {
        key: "packages",
        label: i18n.t("Packages"),
        component: PackagesStep,
        validationKeys: ["name", "department"],
    },
    {
        key: "package-mapping",
        label: i18n.t("Packages mapping"),
        component: PackagesMetadataStep,
        validationKeys: ["name", "department"],
    },
    {
        key: "summary",
        label: i18n.t("Summary"),
        component: SummaryStep,
        validationKeys: [],
        showOnSyncDialog: true,
    },
];

export interface PackageImportWizardProps {
    // isEdit: boolean;
    // onCancel: () => void;
    // onClose: () => void;
    // module: Module;
    // onChange: (module: Module) => void;
}

export const PackageImportWizard: React.FC<PackageImportWizardProps> = () => {
    const location = useLocation();

    //const props: ModuleWizardStepProps = { module, onChange, onCancel, onClose, isEdit };
    //const steps = metadataModuleSteps.map(step => ({ ...step, props }));
    const steps = stepsBaseInfo; //.map(step => ({ ...step, props }));

    const onStepChangeRequest = async (_currentStep: WizardStep, _newStep: WizardStep) => {
        // const index = _(steps).findIndex(step => step.key === newStep.key);
        // return _.take(steps, index).flatMap(({ validationKeys }) =>
        //     module.validate(validationKeys).map(({ description }) => description)
        // );
        return undefined;
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
