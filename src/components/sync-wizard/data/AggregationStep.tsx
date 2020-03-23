import i18n from "@dhis2/d2-i18n";
import { makeStyles } from "@material-ui/core";
import { useD2Api } from "d2-api";
import { useSnackbar } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { DataSyncAggregation } from "../../../types/synchronization";
import { getMetadata } from "../../../utils/synchronization";
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
    const api = useD2Api();
    const classes = useStyles();
    const snackbar = useSnackbar();
    const [indicatorWarning, setIndicatorWarning] = useState<boolean>(false);

    const updateEnableAggregation = (value: boolean) => {
        if (indicatorWarning && !value) {
            snackbar.warning(
                i18n.t(
                    "Without aggregation, any data value related to an indicator will be ignored"
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

    useEffect(() => {
        if (_.isUndefined(syncRule.dataSyncEnableAggregation)) {
            getMetadata(api, syncRule.metadataIds, "id").then(metadata => {
                if (_.keys(metadata).includes("indicators")) {
                    setIndicatorWarning(true);
                    onChange(syncRule.updateDataSyncEnableAggregation(true));
                }
            });
        }
    }, [api, onChange, syncRule]);

    return (
        <React.Fragment>
            <Toggle
                label={i18n.t("Enable data aggregation")}
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
