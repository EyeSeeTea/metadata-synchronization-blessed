import { TextField } from "@material-ui/core";
import React, { ChangeEvent, useMemo } from "react";
import styled from "styled-components";
import i18n from "../../../../../utils/i18n";
import {
    AnalyticsOptions,
    AnalyticsPanelKind,
    defaultAnalyticsOptions,
    RunAnalyticsSettings,
} from "../../../../webapp/msf-aggregate-data/pages/MSFEntities";
import Dropdown from "../../../core/components/dropdown/Dropdown";
import { Toggle } from "../../../core/components/toggle/Toggle";

export interface AnalyticsPanelProps {
    title: string;
    kind: AnalyticsPanelKind;
    runSetting: RunAnalyticsSettings;
    onRunSettingChange(value: RunAnalyticsSettings): void;
    options: AnalyticsOptions | undefined;
    onOptionsChange(options: AnalyticsOptions): void;
}

type SkipFlag = keyof Omit<AnalyticsOptions, "lastYears">;

type FlagDef = { key: SkipFlag; label: string };

const individualFlags = (): FlagDef[] => [
    { key: "skipResourceTables", label: i18n.t("Skip generation of resource tables") },
    { key: "skipEvents", label: i18n.t("Skip generation of event data") },
    { key: "skipEnrollment", label: i18n.t("Skip generation of enrollment data") },
    { key: "skipOrgUnitOwnership", label: i18n.t("Skip generation of organisation unit ownership data") },
    { key: "skipTrackedEntities", label: i18n.t("Skip generation of tracked entity data") },
];

const aggregateFlags = (): FlagDef[] => [
    { key: "skipResourceTables", label: i18n.t("Skip generation of resource tables") },
    { key: "skipAggregate", label: i18n.t("Skip generation of aggregate data and completeness data") },
    { key: "skipOutliers", label: i18n.t("Skip generation of outlier data") },
];

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
    title,
    kind,
    runSetting,
    onRunSettingChange,
    options,
    onOptionsChange,
}) => {
    const runSettingItems = useMemo(
        () => [
            { id: "true" as const, name: i18n.t("True") },
            { id: "false" as const, name: i18n.t("False") },
            { id: "by-sync-rule-settings" as const, name: i18n.t("Use sync rule settings") },
        ],
        []
    );

    const flags = useMemo(() => (kind === "individual" ? individualFlags() : aggregateFlags()), [kind]);

    const effectiveOptions = options ?? defaultAnalyticsOptions;
    const showOptions = runSetting === "true";

    const setLastYears = (event: ChangeEvent<HTMLInputElement>) => {
        const lastYears = parseInt(event.target.value);
        onOptionsChange({ ...effectiveOptions, lastYears });
    };

    const setFlag = (key: SkipFlag) => (value: boolean) => {
        onOptionsChange({ ...effectiveOptions, [key]: value });
    };

    return (
        <Panel>
            <PanelTitle>{title}</PanelTitle>

            <Dropdown<RunAnalyticsSettings>
                label={i18n.t("Run Analytics")}
                items={runSettingItems}
                onValueChange={onRunSettingChange}
                value={runSetting}
                hideEmpty
            />

            {showOptions && (
                <Options>
                    <Flags>
                        {flags.map(({ key, label }) => (
                            <Toggle
                                key={key}
                                label={label}
                                value={effectiveOptions[key] ?? false}
                                onValueChange={setFlag(key)}
                            />
                        ))}
                    </Flags>

                    <YearsField
                        label={i18n.t("Number of last years of data to include")}
                        value={effectiveOptions.lastYears}
                        onChange={setLastYears}
                        type="number"
                        InputLabelProps={{ shrink: true }}
                    />
                </Options>
            )}
        </Panel>
    );
};

const Panel = styled.div`
    flex: 1;
    min-width: 320px;
    padding: 8px 16px 16px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
`;

const PanelTitle = styled.h4`
    margin-top: 0;
`;

const Options = styled.div`
    margin-top: 16px;
`;

const Flags = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
`;

const YearsField = styled(TextField)`
    width: 300px;
`;
