import i18n from "@dhis2/d2-i18n";
import { ConfirmationDialog } from "d2-ui-components";
import React, { useEffect, useState, useCallback } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { useAppContext } from "../../../common/contexts/AppContext";
import PageHeader from "../../components/page-header/PageHeader";
import { TestWrapper } from "../../components/test-wrapper/TestWrapper";
import GeneralInfoForm from "./GeneralInfoForm";

const InstanceCreationPage = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const { id, action } = useParams<{ id: string; action: "new" | "edit" }>();
    const location = useLocation<{ instance?: Instance }>();
    const isEdit = action === "edit" && id;

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [instance, setInstance] = useState<Instance>(
        Instance.build({ name: "", description: "", url: "" })
    );

    useEffect(() => {
        if (location.state?.instance) {
            setInstance(location.state?.instance);
        } else if (isEdit) {
            compositionRoot
                .instances()
                .getById(id)
                .then(setInstance);
        }
    }, [compositionRoot, id, isEdit, location]);

    const cancelSave = useCallback(() => {
        setDialogOpen(true);
    }, []);

    const handleConfirm = useCallback(() => {
        setDialogOpen(true);
        history.push("/instances");
    }, [history]);

    const handleDialogCancel = useCallback(() => {
        setDialogOpen(false);
    }, []);

    const onChange = useCallback((instance: Instance) => {
        setInstance(instance);
    }, []);

    const title = !isEdit ? i18n.t("New Instance") : i18n.t("Edit Instance");

    const cancel = !isEdit ? i18n.t("Cancel Instance Creation") : i18n.t("Cancel Instance Editing");

    return (
        <TestWrapper>
            <ConfirmationDialog
                isOpen={dialogOpen}
                onSave={handleConfirm}
                onCancel={handleDialogCancel}
                title={cancel}
                description={i18n.t("All your changes will be lost. Are you sure?")}
                saveText={i18n.t("Ok")}
            />

            <PageHeader title={title} onBackClick={cancelSave} />

            <GeneralInfoForm instance={instance} onChange={onChange} cancelAction={cancelSave} />
        </TestWrapper>
    );
};

export default InstanceCreationPage;
