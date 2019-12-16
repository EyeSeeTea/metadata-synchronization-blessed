import i18n from "@dhis2/d2-i18n";
import { Typography, withStyles } from "@material-ui/core";
import React from "react";
import SyncRule from "../../models/syncRule";
import RadioButtonGroup from "../radio-button-group/RadioButtonGroup";
import { Toggle } from "../toggle/Toggle";

interface Props {
    syncRule: SyncRule;
    onChange(newParams: SyncRule): void;
    classes: any;
}

const styles = () => ({
    advancedOptionsTitle: {
        marginTop: "40px",
        fontWeight: 500,
    },
});

const SyncParamsSelector = (props: Props) => {
    const { syncRule, onChange, classes } = props;
    const { syncParams, dataParams } = syncRule;

    const changeSharingSettings = (includeSharingSettings: boolean) => {
        onChange(
            syncRule.updateSyncParams({
                ...syncParams,
                includeSharingSettings,
            })
        );
    };

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

    const changeEventsStrategy = (importStrategy: string) => {
        onChange(
            syncRule.updateDataParams({
                ...dataParams,
                importStrategy: importStrategy as "CREATE_AND_UPDATE" | "CREATE" | "UPDATE",
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
                        { id: "CREATE_AND_UPDATE", name: "Create and update" },
                        { id: "CREATE", name: "Create" },
                        { id: "UPDATE", name: "Update" },
                    ]}
                    onValueChange={changeMetadataStrategy}
                />
            )}

            {syncRule.type === "metadata" && (
                <div>
                    <Toggle
                        label={i18n.t("Include user information and sharing settings")}
                        onValueChange={changeSharingSettings}
                        value={!!syncParams.includeSharingSettings}
                    />
                </div>
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
                <RadioButtonGroup
                    value={dataParams.importStrategy || "CREATE_AND_UPDATE"}
                    items={[
                        { id: "CREATE_AND_UPDATE", name: "Create and update" },
                        { id: "CREATE", name: "Create" },
                        { id: "UPDATE", name: "Update" },
                    ]}
                    onValueChange={changeEventsStrategy}
                />
            )}
        </React.Fragment>
    );
};

export default withStyles(styles)(SyncParamsSelector);
