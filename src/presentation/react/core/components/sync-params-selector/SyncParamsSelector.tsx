import { makeStyles, Typography } from "@material-ui/core";
import React from "react";
import { DataSynchronizationParams } from "../../../../../domain/aggregated/entities/DataSynchronizationParams";
import { MetadataSynchronizationParams } from "../../../../../domain/metadata/entities/MetadataSynchronizationParams";
import { SynchronizationRule } from "../../../../../domain/rules/entities/SynchronizationRule";
import i18n from "../../../../../utils/i18n";
import RadioButtonGroup from "../radio-button-group/RadioButtonGroup";
import { Toggle } from "../toggle/Toggle";

interface SyncParamsSelectorProps {
    generateNewUidDisabled?: boolean;
    syncRule: SynchronizationRule;
    onChange(newParams: SynchronizationRule): void;
}

const useStyles = makeStyles({
    advancedOptionsTitle: {
        marginTop: 40,
        fontWeight: 500,
    },
});

const SyncParamsSelector: React.FC<SyncParamsSelectorProps> = ({ syncRule, onChange, generateNewUidDisabled }) => {
    const classes = useStyles();
    const { syncParams, dataParams } = syncRule;

    const changeAtomic = (value: boolean) => {
        onChange(
            syncRule.updateSyncParams({
                ...syncParams,
                atomicMode: value ? "NONE" : "ALL",
            })
        );
    };

    const changeReplace = (value: boolean) => {
        onChange(
            syncRule.updateSyncParams({
                ...syncParams,
                mergeMode: value ? "REPLACE" : "MERGE",
            })
        );
    };

    const changeGenerateUID = (value: boolean) => {
        onChange(
            syncRule.updateDataParams({
                ...dataParams,
                generateNewUid: value,
            })
        );
    };

    const changeMetadataStrategy = (importStrategy: string) => {
        onChange(
            syncRule.updateSyncParams({
                ...syncParams,
                importStrategy: importStrategy as "CREATE_AND_UPDATE" | "CREATE" | "UPDATE",
            })
        );
    };

    const changeAggregatedStrategy = (strategy: string) => {
        onChange(
            syncRule.updateDataParams({
                ...dataParams,
                strategy: strategy as "NEW_AND_UPDATES" | "NEW" | "UPDATES",
            })
        );
    };

    const changeDryRun = (dryRun: boolean) => {
        if (syncRule.type === "metadata" || syncRule.type === "deleted") {
            onChange(
                syncRule.updateSyncParams({
                    ...syncParams,
                    importMode: dryRun ? "VALIDATE" : "COMMIT",
                })
            );
        } else if (syncRule.type === "events") {
            onChange(
                syncRule.updateDataParams({
                    ...dataParams,
                    importMode: dryRun ? "VALIDATE" : "COMMIT",
                })
            );
        } else {
            onChange(
                syncRule.updateDataParams({
                    ...dataParams,
                    dryRun,
                })
            );
        }
    };

    const changeIgnoreDuplicateExistingValues = (ignoreDuplicateExistingValues: boolean) => {
        onChange(
            syncRule.updateDataParams({
                ...dataParams,
                ignoreDuplicateExistingValues,
            })
        );
    };

    const changeAsyncMode = (async: boolean) => {
        onChange(
            syncRule.updateDataParams({
                ...dataParams,
                async,
            })
        );
    };

    return (
        <React.Fragment>
            <Typography className={classes.advancedOptionsTitle} variant={"subtitle1"} gutterBottom>
                {i18n.t("Advanced options")}
            </Typography>

            {syncRule.type === "metadata" && (
                <RadioButtonGroup
                    value={syncParams.importStrategy || "CREATE_AND_UPDATE"}
                    items={[
                        { id: "CREATE_AND_UPDATE", name: i18n.t("Create and update") },
                        { id: "CREATE", name: i18n.t("Create") },
                        { id: "UPDATE", name: i18n.t("Update") },
                    ]}
                    onValueChange={changeMetadataStrategy}
                />
            )}

            {syncRule.type === "metadata" && (
                <div>
                    <Toggle
                        label={i18n.t("Disable atomic verification")}
                        onValueChange={changeAtomic}
                        value={syncParams.atomicMode === "NONE"}
                    />
                </div>
            )}

            {syncRule.type === "metadata" && (
                <div>
                    <Toggle
                        label={i18n.t("Replace objects in destination instance")}
                        onValueChange={changeReplace}
                        value={syncParams.mergeMode === "REPLACE"}
                    />
                </div>
            )}

            {syncRule.type === "aggregated" && (
                <RadioButtonGroup
                    value={dataParams.strategy || "NEW_AND_UPDATES"}
                    items={[
                        { id: "NEW_AND_UPDATES", name: "New and updates" },
                        { id: "NEW", name: "New" },
                        { id: "UPDATES", name: "Updates" },
                    ]}
                    onValueChange={changeAggregatedStrategy}
                />
            )}

            {syncRule.type === "events" && (
                <div>
                    <Toggle
                        disabled={generateNewUidDisabled}
                        label={i18n.t("Generate new UID")}
                        onValueChange={changeGenerateUID}
                        value={dataParams.generateNewUid ?? false}
                    />
                </div>
            )}

            <div>
                <Toggle
                    label={i18n.t("Dry Run")}
                    onValueChange={changeDryRun}
                    value={isDryRunEnabled(syncRule, syncParams, dataParams)}
                />
            </div>

            {(syncRule.type === "events" || syncRule.type === "aggregated") && (
                <div>
                    <Toggle
                        label={
                            syncRule.type === "events"
                                ? i18n.t("Ignore data with same value on destination (only for program indicators)")
                                : i18n.t("Ignore data with same value on destination")
                        }
                        onValueChange={changeIgnoreDuplicateExistingValues}
                        value={dataParams.ignoreDuplicateExistingValues ?? false}
                    />
                </div>
            )}

            {syncRule.type === "events" && (
                <div>
                    <Toggle
                        label={i18n.t("Async mode")}
                        onValueChange={changeAsyncMode}
                        value={dataParams.async ?? true}
                    />
                </div>
            )}
        </React.Fragment>
    );
};

export default SyncParamsSelector;

function isDryRunEnabled(
    syncRule: SynchronizationRule,
    syncParams: MetadataSynchronizationParams,
    dataParams: DataSynchronizationParams
): boolean {
    if (syncRule.type === "metadata" || syncRule.type === "deleted") {
        return syncParams.importMode === "VALIDATE";
    } else if (syncRule.type === "events") {
        return dataParams.importMode === "VALIDATE";
    } else {
        return dataParams.dryRun || false;
    }
}
