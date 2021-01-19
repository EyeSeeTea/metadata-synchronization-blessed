import { makeStyles, TextField, Theme } from "@material-ui/core";
import { ConfirmationDialog } from "d2-ui-components";
import { Dictionary } from "lodash";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { DataElementGroup } from "../../../../../domain/metadata/entities/MetadataEntities";
import i18n from "../../../../../locales";
import { DataElementGroupModel } from "../../../../../models/dhis/metadata";
import Dropdown, { DropdownOption } from "../../../core/components/dropdown/Dropdown";
import { Toggle } from "../../../core/components/toggle/Toggle";
import { useAppContext } from "../../../core/contexts/AppContext";
import { NamedDate, OrgUnitDateSelector } from "../org-unit-date-selector/OrgUnitDateSelector";

export type RunAnalyticsSettings = "true" | "false" | "by-sync-rule-settings";

export type MSFSettings = {
    runAnalytics: RunAnalyticsSettings;
    analyticsYears: number;
    projectMinimumDates: Dictionary<NamedDate>;
    dataElementGroupId?: string;
    deleteDataValuesBeforeSync?: boolean;
    checkInPreviousPeriods?: boolean;
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

    const setAnalyticsYears = (event: ChangeEvent<HTMLInputElement>) => {
        const analyticsYears = parseInt(event.target.value);
        updateSettings(settings => ({ ...settings, analyticsYears }));
    };

    const updateProjectMinimumDates = (projectStartDates: Dictionary<NamedDate>) => {
        updateSettings(settings => ({ ...settings, projectMinimumDates: projectStartDates }));
    };

    const handleSave = () => {
        onSave(settings);
    };

    const [deleteDataValuesBeforeSync, setDeleteDataValuesBeforeSync] = useState<boolean>(false);
    const [checkInPreviousPeriods, setCheckInPreviousPeriods] = useState<boolean>(false);

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

            <div>
                <Toggle
                    label={i18n.t("Delete data values before sync")}
                    onValueChange={setDeleteDataValuesBeforeSync}
                    value={deleteDataValuesBeforeSync}
                />
            </div>

            <div>
                <Toggle
                    label={i18n.t("Check existing data values in previous periods")}
                    onValueChange={setCheckInPreviousPeriods}
                    value={checkInPreviousPeriods}
                />
            </div>

            <h3 className={classes.title}>{i18n.t("Data element filter")}</h3>
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

            <h3 className={classes.title}>{i18n.t("Project minimum dates")}</h3>
            <div>
                <OrgUnitDateSelector
                    projectMinimumDates={settings.projectMinimumDates}
                    onChange={updateProjectMinimumDates}
                />
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
        margin: theme.spacing(0, 0, 2, 1),
        fontSize: "0.8em",
    },
    title: {
        marginTop: 0,
    },
}));
