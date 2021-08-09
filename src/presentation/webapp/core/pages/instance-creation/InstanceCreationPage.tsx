import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { useCallback, useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import i18n from "../../../../../locales";
import { useAppContext } from "../../../../react/core/contexts/AppContext";
import PageHeader from "../../../../react/core/components/page-header/PageHeader";
import { TestWrapper } from "../../../../react/core/components/test-wrapper/TestWrapper";
import GeneralInfoForm from "./GeneralInfoForm";

const InstanceCreationPage = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const { id, action } = useParams<{ id: string; action: "new" | "edit" }>();
    const location = useLocation<{ instance?: Instance }>();
    const isEdit = action === "edit" && id;

    const [error, setError] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [instance, setInstance] = useState<Instance>(Instance.build({ name: "", description: "", url: "" }));

    useEffect(() => {
        if (location.state?.instance) {
            setInstance(location.state?.instance);
        } else if (isEdit) {
            compositionRoot.instances.getById(id).then(result =>
                result.match({
                    success: setInstance,
                    error: () => {
                        setError(true);
                    },
                })
            );
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

    if (error) return null;

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

            {instance.type === "dhis" && (
                <GeneralInfoForm instance={instance} onChange={onChange} cancelAction={cancelSave} />
            )}
        </TestWrapper>
    );
};

export default InstanceCreationPage;
