import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Module } from "../../../../../domain/modules/entities/Module";
import i18n from "../../../../../locales";
import { useAppContext } from "../../../../react/core/contexts/AppContext";
import { ModuleWizard } from "../../../../react/core/components/module-wizard/ModuleWizard";
import PageHeader from "../../../../react/core/components/page-header/PageHeader";
import { MetadataModule } from "../../../../../domain/modules/entities/MetadataModule";

const ModuleCreationPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const { id, action } = useParams<{ id: string; action: "edit" | "new" }>();
    const location = useLocation<{ module?: Module }>();

    const [dialogOpen, updateDialogOpen] = useState(false);
    const [module, updateModule] = useState(() => location.state?.module);

    const isEdit = action === "edit" && (!!module || !!id);
    const title = !isEdit ? i18n.t(`New module`) : i18n.t(`Edit module`);
    const cancel = !isEdit ? i18n.t(`Cancel module creation`) : i18n.t(`Cancel module editing`);

    const closeDialog = useCallback(() => updateDialogOpen(false), [updateDialogOpen]);
    const openDialog = useCallback(() => updateDialogOpen(true), [updateDialogOpen]);

    const onClose = useCallback(() => {
        updateDialogOpen(false);
        history.push(`/modules`);
    }, [updateDialogOpen, history]);

    useEffect(() => {
        if (!module && !!id) compositionRoot.modules.get(id).then(updateModule);
    }, [compositionRoot, module, id]);

    const showWizard = !isEdit || !!module;

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

            {showWizard && (
                <ModuleWizard
                    isEdit={isEdit}
                    onCancel={openDialog}
                    onClose={onClose}
                    module={module ?? MetadataModule.build()}
                    onChange={updateModule}
                />
            )}
        </React.Fragment>
    );
};

export default ModuleCreationPage;
