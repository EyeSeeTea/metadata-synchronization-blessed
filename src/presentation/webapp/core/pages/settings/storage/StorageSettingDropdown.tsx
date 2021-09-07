import { ConfirmationDialog, ConfirmationDialogProps, useLoading } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import i18n from "../../../../../../locales";
import Dropdown from "../../../../../react/core/components/dropdown/Dropdown";
import { useAppContext } from "../../../../../react/core/contexts/AppContext";

export const StorageSettingDropdown: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const loading = useLoading();

    const [selectedOption, setSelectedOption] = useState("dataStore");
    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);

    const options = useMemo(
        () => [
            { id: "dataStore" as const, name: i18n.t("Data Store") },
            { id: "constant" as const, name: i18n.t("Metadata constant") },
        ],
        []
    );

    const changeStorage = useCallback(
        async (storage: "constant" | "dataStore") => {
            loading.show(true, i18n.t("Updating storage location, please wait..."));
            await compositionRoot.config.setStorage(storage);

            const newStorage = await compositionRoot.config.getStorage();
            setSelectedOption(newStorage);
            loading.reset();
        },
        [compositionRoot, loading]
    );

    const showConfirmationDialog = useCallback(
        (storage: "constant" | "dataStore") => {
            updateDialog({
                title: i18n.t("Change storage"),
                description: i18n.t(
                    "When changing the storage of the application, all stored information will be moved to the new storage. This might take a while, please wait. Do you want to proceed?"
                ),
                onCancel: () => {
                    updateDialog(null);
                },
                onSave: async () => {
                    updateDialog(null);
                    await changeStorage(storage);
                },
                cancelText: i18n.t("Cancel"),
                saveText: i18n.t("Proceed"),
            });
        },
        [changeStorage]
    );

    useEffect(() => {
        compositionRoot.config.getStorage().then(storage => setSelectedOption(storage));
    }, [compositionRoot]);

    return (
        <React.Fragment>
            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}

            <Dropdown<"constant" | "dataStore">
                items={options}
                value={selectedOption}
                onValueChange={showConfirmationDialog}
                hideEmpty={true}
                view={"full-width"}
            />
        </React.Fragment>
    );
};
