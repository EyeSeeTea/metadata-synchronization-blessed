import { ConfirmationDialog, useLoading } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Module } from "../../../../domain/modules/entities/Module";
import i18n from "../../../../locales";
import { useAppContext } from "../../../common/contexts/AppContext";
import { ModuleWizard } from "../../components/module-wizard/ModuleWizard";
import PageHeader from "../../components/page-header/PageHeader";

interface SyncRulesCreationParams {
    id: string;
    action: "edit" | "new";
}

const ModuleCreationPage: React.FC = () => {
    const history = useHistory();
    const loading = useLoading();
    const { id, action } = useParams() as SyncRulesCreationParams;
    const { compositionRoot } = useAppContext();

    const [dialogOpen, updateDialogOpen] = useState(false);
    const [editModule, setEditModule] = useState<Module>();

    const isEdit = action === "edit" && !!id;
    const title = !isEdit ? i18n.t(`New module`) : i18n.t(`Edit module`);
    const cancel = !isEdit ? i18n.t(`Cancel module creation`) : i18n.t(`Cancel module editing`);

    const closeDialog = () => updateDialogOpen(false);
    const openDialog = () => updateDialogOpen(true);

    const onClose = () => {
        updateDialogOpen(false);
        history.push(`/modules`);
    };

    useEffect(() => {
        if (isEdit && !!id) {
            loading.show(true, "Loading module");
            compositionRoot.modules.get(id).then(module => {
                setEditModule(module);
                loading.reset();
            });
            loading.reset();
        }
    }, [compositionRoot, loading, isEdit, id]);

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={dialogOpen}
                onSave={onClose}
                onCancel={closeDialog}
                title={cancel}
                description={i18n.t("All your changes will be lost. Are you sure?")}
                saveText={i18n.t("Ok")}
            />

            <PageHeader title={title} onBackClick={openDialog} />

            <ModuleWizard onCancel={openDialog} onClose={onClose} editModule={editModule} />
        </React.Fragment>
    );
};

export default ModuleCreationPage;
