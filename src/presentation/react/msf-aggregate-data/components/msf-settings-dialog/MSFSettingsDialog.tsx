import { Divider } from "@material-ui/core";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { Dictionary } from "lodash";
import React, { useState } from "react";
import styled from "styled-components";
import i18n from "../../../../../utils/i18n";
import {
    AnalyticsOptions,
    MSFSettings,
    RunAnalyticsSettings,
} from "../../../../webapp/msf-aggregate-data/pages/MSFEntities";
import { Toggle } from "../../../core/components/toggle/Toggle";
import { NamedDate, OrgUnitDateSelector } from "../org-unit-date-selector/OrgUnitDateSelector";
import { AnalyticsPanel } from "./AnalyticsPanel";

export interface MSFSettingsDialogProps {
    settings: MSFSettings;
    onSave(settings: MSFSettings): void;
    onClose(): void;
}

export const MSFSettingsDialog: React.FC<MSFSettingsDialogProps> = ({ onClose, onSave, settings: defaultSettings }) => {
    const [settings, updateSettings] = useState<MSFSettings>(defaultSettings);

    const setRunAnalyticsBefore = (runAnalyticsBefore: RunAnalyticsSettings) => {
        updateSettings(settings => ({ ...settings, runAnalyticsBefore }));
    };

    const setRunAnalyticsAfter = (runAnalyticsAfter: RunAnalyticsSettings) => {
        updateSettings(settings => ({ ...settings, runAnalyticsAfter }));
    };

    const setAnalyticsBefore = (analyticsBefore: AnalyticsOptions) => {
        updateSettings(settings => ({ ...settings, analyticsBefore }));
    };

    const setAnalyticsAfter = (analyticsAfter: AnalyticsOptions) => {
        updateSettings(settings => ({ ...settings, analyticsAfter }));
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
            <Section>
                <SectionTitle>{i18n.t("Analytics")}</SectionTitle>

                <Panels>
                    <AnalyticsPanel
                        title={i18n.t("Before sync · Individual data")}
                        kind="individual"
                        runSetting={settings.runAnalyticsBefore}
                        onRunSettingChange={setRunAnalyticsBefore}
                        options={settings.analyticsBefore}
                        onOptionsChange={setAnalyticsBefore}
                    />
                    <AnalyticsPanel
                        title={i18n.t("After sync · Aggregate data")}
                        kind="aggregate"
                        runSetting={settings.runAnalyticsAfter}
                        onRunSettingChange={setRunAnalyticsAfter}
                        options={settings.analyticsAfter}
                        onOptionsChange={setAnalyticsAfter}
                    />
                </Panels>
            </Section>

            <Section>
                <SectionTitle>{i18n.t("Data values settings")}</SectionTitle>

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
            </Section>

            <SpacedDivider />

            <Section>
                <SectionTitle>{i18n.t("Project minimum dates")}</SectionTitle>

                <div>
                    <OrgUnitDateSelector
                        projectMinimumDates={settings.projectMinimumDates}
                        onChange={updateProjectMinimumDates}
                    />
                </div>
            </Section>
        </ConfirmationDialog>
    );
};

const Section = styled.div`
    margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
    margin-top: 0;
`;

const Panels = styled.div`
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
`;

const SpacedDivider = styled(Divider)`
    margin-bottom: 20px;
`;
