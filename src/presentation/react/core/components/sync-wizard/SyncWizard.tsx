import { Wizard, WizardStep } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { SynchronizationRule } from "../../../../../domain/rules/entities/SynchronizationRule";
import i18n from "../../../../../utils/i18n";
import { getValidationMessages } from "../../../../../utils/old-validations";
import { getMetadata } from "../../../../../utils/synchronization";
import { useAppContext } from "../../contexts/AppContext";
import { aggregatedSteps, deletedSteps, DialogOnBeforeNext, eventsSteps, metadataSteps, SyncWizardStep } from "./Steps";

interface SyncWizardProps {
    syncRule: SynchronizationRule;
    originalSyncRule?: SynchronizationRule;
    isDialog?: boolean;
    onChange?(syncRule: SynchronizationRule): void;
    onCancel?(): void;
}

const config = {
    metadata: metadataSteps,
    aggregated: aggregatedSteps,
    events: eventsSteps,
    deleted: deletedSteps,
};

const initialDialogState = {
    title: "",
    showDialog: false,
    dialog: () => null,
};

const SyncWizard: React.FC<SyncWizardProps> = ({
    syncRule,
    originalSyncRule,
    isDialog = false,
    onChange = _.noop,
    onCancel = _.noop,
}) => {
    const location = useLocation();
    const { api } = useAppContext();
    const memoizedRule = useRef(syncRule);
    const [confirmationDialog, setConfirmationDialog] = useState<
        DialogOnBeforeNext & {
            props?: object;
        }
    >(initialDialogState);
    const [stepKey, setStepKey] = useState<string | undefined>(undefined);

    const steps = config[syncRule.type]
        .filter(({ showOnSyncDialog }) => !isDialog || showOnSyncDialog)
        .filter(({ hidden }) => !hidden || !hidden(syncRule))
        .map(step => ({
            ...step,
            props: {
                syncRule,
                originalSyncRule,
                onCancel,
                onChange,
            },
        }));

    const validateStep = useCallback((steps: SyncWizardStep[], newStep: WizardStep, syncRule: SynchronizationRule) => {
        const index = _(steps).findIndex(step => step.key === newStep.key);
        const validationMessages = _.take(steps, index).map(({ validationKeys }) =>
            getValidationMessages(syncRule, validationKeys)
        );

        return _.flatten(validationMessages);
    }, []);

    const onStepChangeRequest = async (currentStep: WizardStep, newStep: WizardStep) => {
        const currentStepConfig = steps.find(step => step.key === currentStep.key) as SyncWizardStep;

        const dialogOnBeforeNext = currentStepConfig?.dialogOnBeforeNext?.(syncRule);

        if (dialogOnBeforeNext?.showDialog) {
            setConfirmationDialog({
                showDialog: true,
                dialog: dialogOnBeforeNext.dialog,
                props: { syncRule, onChange, onDismiss: () => setConfirmationDialog(initialDialogState) },
            });
            return [i18n.t("You need to select credentials for the selected instances.")];
        } else {
            return validateStep(steps, newStep, syncRule);
        }
    };

    // This effect should only run in the first load
    useEffect(() => {
        getMetadata(api, memoizedRule.current.metadataIds, "id").then(metadata => {
            const types = _.keys(metadata);
            onChange(
                memoizedRule.current
                    .updateMetadataTypes(types)
                    .updateDataSyncEnableAggregation(
                        types.includes("indicators") ||
                            types.includes("programIndicators") ||
                            memoizedRule.current.useAggregatedDataExchange
                    )
            );
        });
    }, [api, onChange, memoizedRule]);

    const urlHash = location.hash.slice(1);
    const stepExists = steps.find(step => step.key === urlHash);
    const firstStepKey = steps.map(step => step.key)[0];
    const initialStepKey = stepExists ? urlHash : firstStepKey;

    return (
        <>
            <Wizard
                stepKey={stepKey}
                onStepChange={setStepKey}
                useSnackFeedback={confirmationDialog.showDialog ? false : true}
                onStepChangeRequest={onStepChangeRequest}
                initialStepKey={initialStepKey}
                lastClickableStepIndex={steps.length - 1}
                steps={steps}
            />

            {confirmationDialog.dialog && <confirmationDialog.dialog {...confirmationDialog.props} />}
        </>
    );
};

export default SyncWizard;
