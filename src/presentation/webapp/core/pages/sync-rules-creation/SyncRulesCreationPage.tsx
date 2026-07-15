import { ConfirmationDialog, useLoading } from "@eyeseetea/d2-ui-components";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { SynchronizationRule } from "../../../../../domain/rules/entities/SynchronizationRule";
import { SynchronizationType } from "../../../../../domain/synchronization/entities/SynchronizationType";
import i18n from "../../../../../utils/i18n";
import PageHeader from "../../../../react/core/components/page-header/PageHeader";
import SyncWizard from "../../../../react/core/components/sync-wizard/SyncWizard";
import { TestWrapper } from "../../../../react/core/components/test-wrapper/TestWrapper";
import { useAppContext } from "../../../../react/core/contexts/AppContext";
import { UserSettingsInclusionsConfig } from "../../../../../domain/user-settings/UserSettings";
import { useUserSettings } from "../settings/useUserSettings";

export interface SyncRulesCreationParams {
    id: string;
    action: "edit" | "new";
    type: SynchronizationType;
}

function createSyncRuleWithInclusions(type: SynchronizationType, defaultInclusions: UserSettingsInclusionsConfig) {
    return SynchronizationRule.create(type).setDefaultInclusions(defaultInclusions);
}

const SyncRulesCreation: React.FC = () => {
    const history = useHistory();
    const location = useLocation<{ syncRule?: SynchronizationRule }>();
    const loading = useLoading();
    const { id, action, type } = useParams() as SyncRulesCreationParams;
    const { compositionRoot } = useAppContext();
    const { userSettings } = useUserSettings();
    const replicatedSyncRule = location.state?.syncRule;

    const [dialogOpen, updateDialogOpen] = useState(false);
    const [syncRule, updateSyncRule] = useState(
        replicatedSyncRule ?? createSyncRuleWithInclusions(type, userSettings.inclusionConfig)
    );
    const [originalSyncRule, setOriginalSyncRule] = useState<SynchronizationRule | undefined>(undefined);

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
            compositionRoot.rules.get(id).then(syncRule => {
                updateSyncRule(syncRule ?? SynchronizationRule.create(type));
                setOriginalSyncRule(syncRule ?? SynchronizationRule.create(type));
                loading.reset();
            });
        } else {
            const initialSyncRule =
                replicatedSyncRule ?? createSyncRuleWithInclusions(type, userSettings.inclusionConfig);
            updateSyncRule(initialSyncRule);
            setOriginalSyncRule(initialSyncRule);
        }
    }, [compositionRoot, loading, isEdit, id, type, userSettings.inclusionConfig, replicatedSyncRule]);

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

            <SyncWizard
                syncRule={syncRule}
                originalSyncRule={originalSyncRule}
                onChange={updateSyncRule}
                onCancel={exit}
            />
        </TestWrapper>
    );
};

export default SyncRulesCreation;
