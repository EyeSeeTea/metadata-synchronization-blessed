import { ConfirmationDialog, useLoading, Wizard, WizardStep } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Module } from "../../../../domain/modules/entities/Module";
import i18n from "../../../../locales";
import { parseValidationMessages } from "../../../common/utils/validations";
import PageHeader from "../../components/page-header/PageHeader";
import { moduleSteps } from "../../components/sync-wizard/Steps";

interface SyncRulesCreationParams {
    id: string;
    action: "edit" | "new";
}

const ModuleCreationPage: React.FC = () => {
    const history = useHistory();
    const location = useLocation();
    const loading = useLoading();
    const { id, action } = useParams() as SyncRulesCreationParams;
    const [dialogOpen, updateDialogOpen] = useState(false);
    const [module] = useState<Module>(Module.build());

    const isEdit = action === "edit" && !!id;

    const title = !isEdit ? i18n.t(`New module`) : i18n.t(`Edit module`);

    const cancel = !isEdit ? i18n.t(`Cancel module creation`) : i18n.t(`Cancel module editing`);

    const closeDialog = () => updateDialogOpen(false);
    const openDialog = () => updateDialogOpen(true);

    const exit = () => {
        updateDialogOpen(false);
        history.push(`/modules`);
    };

    const steps = moduleSteps.map(step => ({
        ...step,
        props: {
            syncRule: module,
            onCancel: exit,
            onChange: (...args: any[]) => console.log("update", args),
        },
    }));

    const onStepChangeRequest = async (_currentStep: WizardStep, newStep: WizardStep) => {
        const index = _(steps).findIndex(step => step.key === newStep.key);
        return _.take(steps, index).flatMap(({ validationKeys }) =>
            parseValidationMessages(module.validate(validationKeys))
        );
    };

    useEffect(() => {
        if (isEdit && !!id) {
            loading.show(true, "Loading module");
            /**SyncRule.get(api, id).then(syncRule => {
                updateSyncRule(syncRule);
                loading.reset();
            });**/
            loading.reset();
        }
    }, [loading, isEdit, id]);

    const urlHash = location.hash.slice(1);
    const stepExists = steps.find(step => step.key === urlHash);
    const firstStepKey = steps.map(step => step.key)[0];
    const initialStepKey = stepExists ? urlHash : firstStepKey;

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={dialogOpen}
                onSave={exit}
                onCancel={closeDialog}
                title={cancel}
                description={i18n.t("All your changes will be lost. Are you sure?")}
                saveText={i18n.t("Ok")}
            />

            <PageHeader title={title} onBackClick={openDialog} />

            <Wizard
                useSnackFeedback={true}
                onStepChangeRequest={onStepChangeRequest}
                initialStepKey={initialStepKey}
                lastClickableStepIndex={steps.length - 1}
                steps={steps}
            />
        </React.Fragment>
    );
};

export default ModuleCreationPage;
