import { ConfirmationDialog, useLoading } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import PageHeader from "../../../../react/core/components/page-header/PageHeader";
import SyncWizard from "../../../../react/core/components/sync-wizard/SyncWizard";
import { TestWrapper } from "../../../../react/core/components/test-wrapper/TestWrapper";
import { useAppContext } from "../../../../react/core/contexts/AppContext";
import { SynchronizationType } from "../../../../../domain/synchronization/entities/SynchronizationType";
import i18n from "../../../../../locales";
import SyncRule from "../../../../../models/syncRule";

export interface SyncRulesCreationParams {
    id: string;
    action: "edit" | "new";
    type: SynchronizationType;
}

const SyncRulesCreation: React.FC = () => {
    const history = useHistory();
    const location = useLocation<{ syncRule?: SyncRule }>();
    const loading = useLoading();
    const { id, action, type } = useParams() as SyncRulesCreationParams;
    const { api } = useAppContext();
    const [dialogOpen, updateDialogOpen] = useState(false);
    const [syncRule, updateSyncRule] = useState(location.state?.syncRule ?? SyncRule.create(type));
    const isEdit = action === "edit" && !!id;

    const title = !isEdit
        ? i18n.t(`New {{type}} synchronization rule`, { type })
        : i18n.t(`Edit {{type}} synchronization rule`, { type });

    const cancel = !isEdit
        ? i18n.t(`Cancel {{type}} synchronization rule creation`, { type })
        : i18n.t(`Cancel {{type}} synchronization rule editing`, { type });

    const closeDialog = () => updateDialogOpen(false);
    const openDialog = () => updateDialogOpen(true);

    const exit = () => {
        updateDialogOpen(false);
        history.push(`/sync-rules/${type}`);
    };

    useEffect(() => {
        if (isEdit && !!id) {
            loading.show(true, "Loading sync rule");
            SyncRule.get(api, id).then(syncRule => {
                updateSyncRule(syncRule);
                loading.reset();
            });
        }
    }, [api, loading, isEdit, id]);

    return (
        <TestWrapper>
            <ConfirmationDialog
                isOpen={dialogOpen}
                onSave={exit}
                onCancel={closeDialog}
                title={cancel}
                description={i18n.t("All your changes will be lost. Are you sure?")}
                saveText={i18n.t("Ok")}
            />

            <PageHeader title={title} onBackClick={openDialog} />

            <SyncWizard syncRule={syncRule} onChange={updateSyncRule} onCancel={exit} />
        </TestWrapper>
    );
};

export default SyncRulesCreation;
