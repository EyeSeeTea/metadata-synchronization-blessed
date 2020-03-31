import i18n from "@dhis2/d2-i18n";
import { makeStyles } from "@material-ui/core";
import { useSnackbar } from "d2-ui-components";
import React from "react";
import { DataSyncAggregation } from "../../../types/synchronization";
import Dropdown from "../../dropdown/Dropdown";
import { Toggle } from "../../toggle/Toggle";
import { SyncWizardStepProps } from "../Steps";

const useStyles = makeStyles({
    dropdown: {
        marginTop: 20,
        marginLeft: -10,
    },
    fixedPeriod: {
        marginTop: 5,
        marginBottom: -20,
    },
    datePicker: {
        marginTop: -10,
    },
});

export const aggregationItems = [
    { id: "DAILY", name: i18n.t("Daily"), format: "YYYYMMDD" },
    { id: "WEEKLY", name: i18n.t("Weekly"), format: "YYYY[W]W" },
    { id: "MONTHLY", name: i18n.t("Monthly"), format: "YYYYMM" },
    { id: "QUARTERLY", name: i18n.t("Quarterly"), format: "YYYY[Q]Q" },
    { id: "YEARLY", name: i18n.t("Yearly"), format: "YYYY" },
];

const AggregationStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const classes = useStyles();
    const snackbar = useSnackbar();

    const updateEnableAggregation = (value: boolean) => {
        if (syncRule.metadataTypes.includes("indicators") && !value) {
            snackbar.warning(
                i18n.t(
                    "Without aggregation, any data value related to an indicator will be ignored"
                )
            );
        } else if (syncRule.metadataTypes.includes("programIndicators") && !value) {
            snackbar.warning(
                i18n.t(
                    "Without aggregation, program indicators will not be aggregated and synchronized"
                )
            );
        }
        onChange(syncRule.updateDataSyncEnableAggregation(value).updateDataSyncAggregationType());
    };

    const updateAggregationType = (value: DataSyncAggregation) => {
        onChange(
            syncRule.updateDataSyncEnableAggregation(true).updateDataSyncAggregationType(value)
        );
    };

    return (
        <React.Fragment>
            <Toggle
                label={
                    syncRule.type === "aggregated"
                        ? i18n.t("Enable data aggregation")
                        : i18n.t("Aggregate and sync program indicators")
                }
                value={!!syncRule.dataSyncEnableAggregation}
                onValueChange={updateEnableAggregation}
            />

            {syncRule.dataSyncEnableAggregation && (
                <div className={classes.dropdown}>
                    <Dropdown
                        label={i18n.t("Aggregation type")}
                        items={aggregationItems}
                        value={syncRule.dataSyncAggregationType ?? ""}
                        onValueChange={updateAggregationType}
                    />
                </div>
            )}
        </React.Fragment>
    );
};

export default AggregationStep;
