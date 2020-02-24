import { useD2 } from "d2-api";
import { Wizard, WizardStep } from "d2-ui-components";
import _ from "lodash";
import React from "react";
import { useLocation } from "react-router-dom";
import SyncRule from "../../models/syncRule";
import { getValidationMessages } from "../../utils/validations";
import { aggregatedSteps, deletedSteps, eventsSteps, metadataSteps } from "./Steps";

interface SyncWizardProps {
    syncRule: SyncRule;
    isDialog?: boolean;
    onChange?(syncRule: SyncRule): void;
    onCancel?(): void;
}

const config = {
    metadata: metadataSteps,
    aggregated: aggregatedSteps,
    events: eventsSteps,
    deleted: deletedSteps,
};

const SyncWizard: React.FC<SyncWizardProps> = ({
    syncRule,
    isDialog = false,
    onChange = _.noop,
    onCancel = _.noop,
}) => {
    const location = useLocation();
    const d2 = useD2();

    const steps = config[syncRule.type]
        .filter(({ showOnSyncDialog }) => !isDialog || showOnSyncDialog)
        .map(step => ({
            ...step,
            props: {
                syncRule,
                onCancel,
                onChange,
            },
        }));

    const onStepChangeRequest = async (_currentStep: WizardStep, newStep: WizardStep) => {
        const index = _(steps).findIndex(step => step.key === newStep.key);
        const validationMessages = await Promise.all(
            _.take(steps, index).map(({ validationKeys }) =>
                getValidationMessages(d2, syncRule, validationKeys)
            )
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

export default SyncWizard;
