import { Wizard, WizardStep } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { SynchronizationRule } from "../../../../../domain/rules/entities/SynchronizationRule";
import { getValidationMessages } from "../../../../../utils/old-validations";
import { getMetadata } from "../../../../../utils/synchronization";
import { useAppContext } from "../../contexts/AppContext";
import { aggregatedSteps, deletedSteps, eventsSteps, metadataSteps } from "./Steps";

interface SyncWizardProps {
    syncRule: SynchronizationRule;
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

const SyncWizard: React.FC<SyncWizardProps> = ({
    syncRule,
    isDialog = false,
    onChange = _.noop,
    onCancel = _.noop,
}) => {
    const location = useLocation();
    const { api } = useAppContext();
    const memoizedRule = useRef(syncRule);

    const steps = config[syncRule.type]
        .filter(({ showOnSyncDialog }) => !isDialog || showOnSyncDialog)
        .filter(({ hidden }) => !hidden || !hidden(syncRule))
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
        const validationMessages = _.take(steps, index).map(({ validationKeys }) =>
            getValidationMessages(syncRule, validationKeys)
        );

        return _.flatten(validationMessages);
    };

    // This effect should only run in the first load
    useEffect(() => {
        getMetadata(api, memoizedRule.current.metadataIds, "id").then(metadata => {
            const types = _.keys(metadata);
            onChange(
                memoizedRule.current
                    .updateMetadataTypes(types)
                    .updateDataSyncEnableAggregation(
                        types.includes("indicators") || types.includes("programIndicators")
                    )
            );
        });
    }, [api, onChange, memoizedRule]);

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
