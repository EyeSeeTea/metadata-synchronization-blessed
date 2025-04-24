import { ConfirmationDialogProps } from "@eyeseetea/d2-ui-components";
import { useCallback, useEffect, useState } from "react";
import { AppStorageType } from "../../../../../domain/storage-client-config/entities/StorageConfig";
import { Settings, SettingsParams } from "../../../../../domain/settings/Settings";
import i18n from "../../../../../utils/i18n";
import { useAppContext } from "../../../../react/core/contexts/AppContext";
import { useHistory } from "react-router-dom";

type ValidationForm<Form> = {
    [Key in keyof Form]: {
        hasError: boolean;
        message: string;
        value: Form[Key];
    };
};

type SettingsForm = ValidationForm<SettingsParams>;

const initialSettingsForm = {
    historyRetentionDays: { hasError: false, message: "", value: "" },
};

export function useSettings() {
    const { newCompositionRoot } = useAppContext();

    const [storageType, setStorageType] = useState<AppStorageType>();
    const [savedStorageType, setSavedStorageType] = useState<AppStorageType>();

    const [settingsForm, setSettingsForm] = useState<SettingsForm>(initialSettingsForm);

    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string | undefined>();
    const [error, setError] = useState<string | undefined>(undefined);
    const [info, setInfo] = useState<string | undefined>(undefined);

    const history = useHistory();
    const backHome = useCallback(() => history.push("/dashboard"), [history]);

    useEffect(() => {
        if (!storageType)
            return newCompositionRoot.config.getStorageClient.execute().run(
                storage => {
                    setStorageType(storage);
                    setSavedStorageType(storage);
                },
                error => {
                    console.error(`error fetching storage client in useeffect :  ${error}`);
                }
            );
    }, [newCompositionRoot, storageType]);

    useEffect(() => {
        newCompositionRoot.settings.get.execute().run(
            settings => {
                setSettingsForm({
                    historyRetentionDays: {
                        hasError: false,
                        message: "",
                        value: settings.historyRetentionDays?.toString() || "",
                    },
                });
            },
            error => {
                console.error(`error fetching settings in useSettings :  ${error}`);
            }
        );
    }, [newCompositionRoot.settings.get]);

    const changeStorage = useCallback(
        (storage: AppStorageType) => {
            setLoadingMessage(i18n.t(`Updating storage location to ${storage} , please wait... `));

            return newCompositionRoot.config.setStorageClient.execute(storage).run(
                () => {
                    return newCompositionRoot.config.getStorageClient.execute().run(
                        newStorage => {
                            setStorageType(newStorage);
                            setLoadingMessage(undefined);
                            backHome();
                        },
                        error => {
                            console.error(`error fetching storage client:  ${error}`);
                            setLoadingMessage(undefined);
                        }
                    );
                },
                error => {
                    console.error(`error setting storage client:  ${error}`);
                    setLoadingMessage(undefined);
                }
            );
        },
        [newCompositionRoot, backHome]
    );

    const saveSettings = useCallback(() => {
        const settings = Settings.create({
            historyRetentionDays: settingsForm.historyRetentionDays.value,
        }).getOrThrow();

        return newCompositionRoot.settings.save.execute(settings).run(
            () => {
                setInfo(i18n.t("Settings saved succesfully!"));
            },
            error => {
                setError(`${i18n.t("An error has occurred saving settings")}:${error}`);
            }
        );
    }, [newCompositionRoot.settings, settingsForm.historyRetentionDays.value]);

    const showConfirmationDialog = useCallback(() => {
        updateDialog({
            title: i18n.t("Change storage"),
            description: i18n.t(
                "When changing the storage of the application, all stored information will be moved to the new storage. This might take a while, please wait. Do you want to proceed?"
            ),
            onCancel: () => {
                updateDialog(null);
            },
            onSave: () => {
                updateDialog(null);
                storageType && changeStorage(storageType);
                saveSettings();
            },
            cancelText: i18n.t("Cancel"),
            saveText: i18n.t("Proceed"),
        });
    }, [changeStorage, saveSettings, storageType]);

    const onChangeSettings = useCallback((settings: SettingsParams) => {
        const settingsValidation = Settings.create({ historyRetentionDays: settings.historyRetentionDays });

        settingsValidation.match({
            success: () =>
                setSettingsForm({
                    historyRetentionDays: { hasError: false, message: "", value: settings.historyRetentionDays },
                }),
            error: errors => {
                const historyRetentionDaysError = errors.find(error => error.property === "historyRetentionDays");

                setSettingsForm({
                    historyRetentionDays: {
                        hasError: historyRetentionDaysError !== undefined,
                        message: historyRetentionDaysError?.description || "",
                        value: settings.historyRetentionDays,
                    },
                });
            },
        });
    }, []);

    const onSave = useCallback(() => {
        if (storageType !== savedStorageType) {
            showConfirmationDialog();
        } else {
            saveSettings();
        }
    }, [saveSettings, savedStorageType, showConfirmationDialog, storageType]);

    const onCancel = useCallback(() => backHome(), [backHome]);

    return {
        storageType,
        settingsForm,
        onChangeSettings,
        onCancel,
        onSave,
        dialogProps,
        loadingMessage,
        error,
        setStorageType,
        info,
    };
}
