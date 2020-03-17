import i18n from "@dhis2/d2-i18n";
import { makeStyles } from "@material-ui/core";
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

const aggregationItems = [
    { id: "DAILY", name: i18n.t("Daily"), format: "YYYYMMDD" },
    { id: "WEEKLY", name: i18n.t("Weekly"), format: "YYYY[W]W" },
    { id: "MONTHLY", name: i18n.t("Monthly"), format: "YYYYMM" },
    { id: "QUARTERLY", name: i18n.t("Quarterly"), format: "YYYY[Q]Q" },
    { id: "YEARLY", name: i18n.t("Yearly"), format: "YYYY" },
];

const AggregationStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const classes = useStyles();

    const updateEnableAggregation = (value: boolean) => {
        onChange(syncRule.updateDataSyncEnableAggregation(value).updateDataSyncAggregationType());
    };

    const updateAggregationType = (value: DataSyncAggregation) => {
        onChange(syncRule.updateDataSyncAggregationType(value));
    };

    return (
        <React.Fragment>
            <Toggle
                label={i18n.t("Enable data aggregation")}
                value={syncRule.dataSyncEnableAggregation}
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
