import { ConfirmationDialogProps } from "@eyeseetea/d2-ui-components";
import { useCallback, useEffect, useState } from "react";
import { StorageType } from "../../../../../domain/config/entities/Config";
import i18n from "../../../../../locales";
import { useAppContext } from "../../../../react/core/contexts/AppContext";

export function useSettings() {
    const { compositionRoot } = useAppContext();

    const [storageType, setStorageType] = useState<StorageType>("dataStore");
    const [savedStorageType, setSavedStorageType] = useState<StorageType>("dataStore");
    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string | undefined>();
    const [goHome, setGoHome] = useState<boolean>(false);

    useEffect(() => {
        compositionRoot.config.getStorage().then(storage => {
            setStorageType(storage);
            setSavedStorageType(storage);
        });
    }, [compositionRoot]);

    const changeStorage = useCallback(
        async (storage: StorageType) => {
            setLoadingMessage(i18n.t("Updating storage location, please wait..."));
            await compositionRoot.config.setStorage(storage);

            const newStorage = await compositionRoot.config.getStorage();
            setStorageType(newStorage);
            setLoadingMessage(undefined);
            setGoHome(true);
        },
        [compositionRoot.config]
    );

    const showConfirmationDialog = useCallback(() => {
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
                changeStorage(storageType);
            },
            cancelText: i18n.t("Cancel"),
            saveText: i18n.t("Proceed"),
        });
    }, [changeStorage, storageType]);

    const onChangeStorageType = useCallback((storage: StorageType) => setStorageType(storage), []);

    const onSave = useCallback(() => {
        if (storageType !== savedStorageType) {
            showConfirmationDialog();
        } else {
            setGoHome(true);
        }
    }, [savedStorageType, showConfirmationDialog, storageType]);

    const onCancel = useCallback(() => setGoHome(true), []);

    return { storageType, onChangeStorageType, onCancel, onSave, dialogProps, loadingMessage, goHome };
}
