import React from "react";
import i18n from "@dhis2/d2-i18n";
import { ConfirmationDialog, Wizard } from "d2-ui-components";
import DialogContent from "@material-ui/core/DialogContent";
import { getValidationMessages } from "../../../utils/validations";
import { D2 } from "../../../types/d2";
import SyncRule from "../../../models/syncRule";

/**
 * TODO: This component is new version of SyncDialog using SyncRule model and wizard
 * to on-demand synchronizations. On the future old SyncDialog should be deleted
 * when not being used
 */

interface SyncWizardDialogProps {
    title: string;
    d2: D2;
    isOpen: boolean;
    stepsBaseInfo: any[];
    syncRule: SyncRule;
    handleClose: (importResponse?: any) => void;
    task: (syncRule: SyncRule) => void;
    onChange: (syncRule: SyncRule) => void;
    enableSync: boolean;
}

const SyncWizardDialog: React.FC<SyncWizardDialogProps> = ({
    title,
    d2,
    isOpen,
    stepsBaseInfo,
    syncRule,
    handleClose,
    task,
    onChange,
    enableSync,
}) => {
    const steps = stepsBaseInfo.map(step => ({
        ...(step as object),
        props: {
            d2,
            syncRule,
            onCancel: handleClose,
            onChange: onChange,
        },
    }));

    const handleExecute = async () => task(syncRule);

    const onStepChangeRequest = async (currentStep: any) => {
        return getValidationMessages(d2, syncRule, currentStep.validationKeys);
    };

    const handleCancel = () => {
        handleClose();
    };

    const firstStepKey = steps.map((step: any) => step.key)[0];
    const lastClickableStepIndex = steps.length - 1;

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={isOpen}
                title={title}
                onSave={handleExecute}
                onCancel={handleCancel}
                saveText={i18n.t("Synchronize")}
                maxWidth={"lg"}
                fullWidth={true}
                disableSave={!enableSync}
            >
                <DialogContent>
                    <Wizard
                        useSnackFeedback={true}
                        onStepChangeRequest={onStepChangeRequest}
                        initialStepKey={firstStepKey}
                        lastClickableStepIndex={lastClickableStepIndex}
                        steps={steps}
                    />
                </DialogContent>
            </ConfirmationDialog>
        </React.Fragment>
    );
};

export default SyncWizardDialog;
