import { ConfirmationDialog, useLoading } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import PageHeader from "../../components/page-header/PageHeader";
import i18n from "../../../../locales";

interface SyncRulesCreationParams {
    id: string;
    action: "edit" | "new";
}

const ModulesCreationPage: React.FC = () => {
    const history = useHistory();
    const loading = useLoading();
    const { id, action } = useParams() as SyncRulesCreationParams;
    const [dialogOpen, updateDialogOpen] = useState(false);
    const isEdit = action === "edit" && !!id;

    const title = !isEdit ? i18n.t(`New module`) : i18n.t(`Edit module`);

    const cancel = !isEdit ? i18n.t(`Cancel module creation`) : i18n.t(`Cancel module editing`);

    const closeDialog = () => updateDialogOpen(false);
    const openDialog = () => updateDialogOpen(true);

    const exit = () => {
        updateDialogOpen(false);
        history.push(`/modules`);
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
        </React.Fragment>
    );
};

export default ModulesCreationPage;
