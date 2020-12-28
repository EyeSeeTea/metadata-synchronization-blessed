import { makeStyles, TextField, Theme } from "@material-ui/core";
import { ConfirmationDialog } from "d2-ui-components";
import React, { useEffect, useMemo, useState } from "react";
import { DataElementGroup } from "../../../../../domain/metadata/entities/MetadataEntities";
import i18n from "../../../../../locales";
import { DataElementGroupModel } from "../../../../../models/dhis/metadata";
import Dropdown, { DropdownOption } from "../../../core/components/dropdown/Dropdown";
import { useAppContext } from "../../../core/contexts/AppContext";

export type RunAnalyticsSettings = "true" | "false" | "by-sync-rule-settings";

export type MSFSettings = {
    runAnalytics: RunAnalyticsSettings;
    analyticsYears: number;
    dataElementGroupId?: string;
};

export interface MSFSettingsDialogProps {
    settings: MSFSettings;
    onSave(settings: MSFSettings): void;
    onClose(): void;
}

export const MSFSettingsDialog: React.FC<MSFSettingsDialogProps> = ({
    onClose,
    onSave,
    settings: defaultSettings,
}) => {
    const classes = useStyles();
    const { compositionRoot } = useAppContext();

    const [settings, updateSettings] = useState<MSFSettings>(defaultSettings);
    const [catOptionGroups, setDataElementGroups] = useState<DropdownOption<string>[]>([]);

    useEffect(() => {
        compositionRoot.metadata
            .listAll({
                type: DataElementGroupModel.getCollectionName(),
                paging: false,
                order: {
                    field: "displayName" as const,
                    order: "asc" as const,
                },
            })
            .then(data => {
                const dataElementGroups = data as DataElementGroup[];

                setDataElementGroups(
                    dataElementGroups.map(group => ({ id: group.id, name: group.name }))
                );
            });
    }, [compositionRoot.metadata]);

    const analyticsSettingItems = useMemo(() => {
        return [
            {
                id: "true" as const,
                name: i18n.t("True"),
            },
            {
                id: "false" as const,
                name: i18n.t("False"),
            },
            {
                id: "by-sync-rule-settings" as const,
                name: i18n.t("Use sync rule settings"),
            },
        ];
    }, []);

    const setRunAnalytics = (runAnalytics: RunAnalyticsSettings) => {
        updateSettings(settings => ({ ...settings, runAnalytics }));
    };

    const setSelectedDataElementGroup = (dataElementGroupId: string) => {
        updateSettings(settings => ({ ...settings, dataElementGroupId }));
    };

    const handleSave = () => {
        onSave(settings);
    };

    return (
        <ConfirmationDialog
            open={true}
            maxWidth="sm"
            fullWidth={true}
            title={i18n.t("MSF Settings")}
            onCancel={onClose}
            onSave={handleSave}
            cancelText={i18n.t("Cancel")}
            saveText={i18n.t("Save")}
        >
            <div className={classes.selector}>
                <Dropdown<RunAnalyticsSettings>
                    label={i18n.t("Run Analytics")}
                    items={analyticsSettingItems}
                    onValueChange={setRunAnalytics}
                    value={settings.runAnalytics}
                    hideEmpty
                />
                <TextField
                    className={classes.yearsSelector}
                    label={i18n.t("Number of years to include")}
                    value={settings.analyticsYears}
                    type="number"
                />
            </div>
            <div className={classes.selector}>
                <Dropdown
                    label={i18n.t("Data Element Group *")}
                    items={catOptionGroups}
                    onValueChange={setSelectedDataElementGroup}
                    value={settings.dataElementGroupId ?? ""}
                    hideEmpty
                />
            </div>
            <div className={classes.info}>
                {i18n.t(
                    "* Data Element Group: used to check existing data values in the destination data elements",
                    { nsSeparator: false }
                )}
            </div>
        </ConfirmationDialog>
    );
};

const useStyles = makeStyles((theme: Theme) => ({
    selector: {
        margin: theme.spacing(3, 0, 3, 0),
    },
    yearsSelector: {
        minWidth: 250,
        marginTop: -8,
        marginLeft: 15,
    },
    info: {
        margin: theme.spacing(0, 0, 0, 1),
        fontSize: "0.8em",
    },
}));
