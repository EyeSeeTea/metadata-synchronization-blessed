import { useD2 } from "d2-api";
import { Wizard } from "d2-ui-components";
import _ from "lodash";
import React from "react";
import { useLocation } from "react-router-dom";
import SyncRule from "../../models/syncRule";
import { getValidationMessages } from "../../utils/validations";
import { dataSteps, metadataSteps } from "./Steps";

interface SyncWizardProps {
    syncRule: SyncRule;
    isEdit?: boolean;
    isDialog?: boolean;
    onChange?(syncRule: SyncRule): void;
    onCancel?(): void;
}

const SyncWizard: React.FC<SyncWizardProps> = ({
    syncRule,
    isEdit = false,
    isDialog = false,
    onChange = _.noop,
    onCancel = _.noop,
}) => {
    const location = useLocation();
    const d2 = useD2();

    const stepsBaseInfo = syncRule.type === "metadata" ? metadataSteps : dataSteps;

    const steps = stepsBaseInfo
        .filter(({ showOnSyncDialog }) => !isDialog || showOnSyncDialog)
        .map(step => ({
            ...step,
            props: {
                syncRule,
                onCancel,
                onChange,
            },
        }));

    const onStepChangeRequest = async (currentStep: any) => {
        return getValidationMessages(d2, syncRule, currentStep.validationKeys);
    };

    const urlHash = location.hash.slice(1);
    const stepExists = steps.find(step => step.key === urlHash);
    const firstStepKey = steps.map(step => step.key)[0];
    const initialStepKey = stepExists ? urlHash : firstStepKey;
    const lastClickableStepIndex = isEdit ? steps.length - 1 : 0;

    return (
        <Wizard
            useSnackFeedback={true}
            onStepChangeRequest={onStepChangeRequest}
            initialStepKey={initialStepKey}
            lastClickableStepIndex={lastClickableStepIndex}
            steps={steps}
        />
    );
};

export default SyncWizard;
