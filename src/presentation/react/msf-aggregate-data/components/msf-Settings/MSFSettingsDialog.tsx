import { ConfirmationDialog } from "d2-ui-components";
import React, { useMemo, useState } from "react";
import i18n from "../../../../../locales";
import Dropdown from "../../../core/components/dropdown/Dropdown";

export type RunAnalyticsSettings = boolean | "by-sync-rule-settings";

export type MSFSettings = {
    runAnalytics: RunAnalyticsSettings;
};

export interface MSFSettingsDialogProps {
    msfSettings: MSFSettings;
    onClose(): void;
    onSave(msfSettings: MSFSettings): void;
}

export const MSFSettingsDialog: React.FC<MSFSettingsDialogProps> = ({
    onClose,
    onSave,
    msfSettings,
}) => {
    const [useSyncRule, setUseSyncRule] = useState(msfSettings.runAnalytics.toString());

    const useSyncRuleItems = useMemo(() => {
        return [
            {
                id: "true",
                name: i18n.t("True"),
            },
            {
                id: "false",
                name: i18n.t("False"),
            },
            {
                id: "by-sync-rule-settings",
                name: i18n.t("Use sync rule settings"),
            },
        ];
    }, []);

    const handleSave = () => {
        const msfSettings: MSFSettings = {
            runAnalytics:
                useSyncRule === "by-sync-rule-settings"
                    ? "by-sync-rule-settings"
                    : useSyncRule === "true"
                    ? true
                    : false,
        };

        onSave(msfSettings);
    };

    return (
        <ConfirmationDialog
            open={true}
            maxWidth="xs"
            fullWidth={true}
            title={i18n.t("MSF Settings")}
            onCancel={onClose}
            onSave={() => handleSave()}
            cancelText={i18n.t("Cancel")}
            saveText={i18n.t("Save")}
        >
            <Dropdown
                label={i18n.t("Run Analytics")}
                items={useSyncRuleItems}
                onValueChange={setUseSyncRule}
                value={useSyncRule}
                hideEmpty
            />
        </ConfirmationDialog>
    );
};
