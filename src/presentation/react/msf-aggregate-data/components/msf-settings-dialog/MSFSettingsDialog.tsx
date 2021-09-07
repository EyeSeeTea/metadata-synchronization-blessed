import { makeStyles, TextField, Theme } from "@material-ui/core";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { Dictionary } from "lodash";
import React, { ChangeEvent, useMemo, useState } from "react";
import i18n from "../../../../../locales";
import { MSFSettings, RunAnalyticsSettings } from "../../../../webapp/msf-aggregate-data/pages/MSFEntities";
import Dropdown from "../../../core/components/dropdown/Dropdown";
import { Toggle } from "../../../core/components/toggle/Toggle";
import { NamedDate, OrgUnitDateSelector } from "../org-unit-date-selector/OrgUnitDateSelector";

export interface MSFSettingsDialogProps {
    settings: MSFSettings;
    onSave(settings: MSFSettings): void;
    onClose(): void;
}

export const MSFSettingsDialog: React.FC<MSFSettingsDialogProps> = ({ onClose, onSave, settings: defaultSettings }) => {
    const classes = useStyles();

    const [settings, updateSettings] = useState<MSFSettings>(defaultSettings);

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

    const setAnalyticsYears = (event: ChangeEvent<HTMLInputElement>) => {
        const analyticsYears = parseInt(event.target.value);
        updateSettings(settings => ({ ...settings, analyticsYears }));
    };

    const updateProjectMinimumDates = (projectStartDates: Dictionary<NamedDate>) => {
        updateSettings(settings => ({ ...settings, projectMinimumDates: projectStartDates }));
    };

    const setDeleteDataValuesBeforeSync = (deleteDataValuesBeforeSync: boolean) => {
        updateSettings(settings => ({ ...settings, deleteDataValuesBeforeSync }));
    };

    const setCheckInPreviousPeriods = (checkInPreviousPeriods: boolean) => {
        updateSettings(settings => ({ ...settings, checkInPreviousPeriods }));
    };

    const handleSave = () => {
        onSave(settings);
    };

    return (
        <ConfirmationDialog
            open={true}
            maxWidth="lg"
            fullWidth={true}
            title={i18n.t("MSF Settings")}
            onCancel={onClose}
            onSave={handleSave}
            cancelText={i18n.t("Cancel")}
            saveText={i18n.t("Save")}
        >
            <div className={classes.section}>
                <h3 className={classes.title}>{i18n.t("Analytics")}</h3>

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
                        onChange={setAnalyticsYears}
                        type="number"
                    />
                </div>
            </div>

            <div className={classes.section}>
                <h3 className={classes.title}>{i18n.t("Data values settings")}</h3>

                <div>
                    <Toggle
                        label={i18n.t("Delete data values before sync")}
                        onValueChange={setDeleteDataValuesBeforeSync}
                        value={settings.deleteDataValuesBeforeSync ?? false}
                    />
                </div>

                <div>
                    <Toggle
                        label={i18n.t("Check existing data values in previous periods")}
                        onValueChange={setCheckInPreviousPeriods}
                        value={settings.checkInPreviousPeriods ?? false}
                    />
                </div>
            </div>

            <div className={classes.section}>
                <h3 className={classes.title}>{i18n.t("Project minimum dates")}</h3>

                <div>
                    <OrgUnitDateSelector
                        projectMinimumDates={settings.projectMinimumDates}
                        onChange={updateProjectMinimumDates}
                    />
                </div>
            </div>
        </ConfirmationDialog>
    );
};

const useStyles = makeStyles((theme: Theme) => ({
    selector: {
        margin: theme.spacing(0, 0, 3, 0),
    },
    yearsSelector: {
        minWidth: 250,
        marginTop: -8,
        marginLeft: 15,
    },
    info: {
        margin: theme.spacing(0, 0, 2, 1),
        fontSize: "0.8em",
    },
    title: {
        marginTop: 0,
    },
    section: {
        marginBottom: 20,
    },
}));
