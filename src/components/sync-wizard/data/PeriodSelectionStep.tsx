import i18n from "@dhis2/d2-i18n";
import { makeStyles } from "@material-ui/core";
import { DatePicker } from "d2-ui-components";
import React from "react";
import SyncRule from "../../../models/syncRule";
import { DataSyncPeriod } from "../../../types/synchronization";
import Dropdown from "../../dropdown/Dropdown";
import Typography from "@material-ui/core/Typography";

interface PeriodSelectionStepProps {
    syncRule: SyncRule;
    onChange: (syncRule: SyncRule) => void;
}

const useStyles = makeStyles({
    title: {
        fontWeight: 500,
    },
    dropdown: {
        marginTop: 20,
        marginLeft: -10,
    },
    fixedPeriod: {
        marginTop: 20,
        marginBottom: -20,
    },
    datePicker: {
        marginTop: -10,
    },
});

const dropdownItems = [
    { id: "ALL", name: i18n.t("All periods") },
    { id: "FIXED", name: i18n.t("Fixed period") },
    { id: "LAST_DAY", name: i18n.t("Last day") },
    { id: "LAST_WEEK", name: i18n.t("Last week") },
    { id: "LAST_MONTH", name: i18n.t("Last month") },
    { id: "LAST_THREE_MONTHS", name: i18n.t("Last three months") },
    { id: "LAST_SIX_MONTHS", name: i18n.t("Last six months") },
    { id: "LAST_YEAR", name: i18n.t("Last year") },
];

export default function PeriodSelectionStep(props: PeriodSelectionStepProps) {
    const { syncRule, onChange } = props;
    const classes = useStyles();

    const updatePeriod = (period: DataSyncPeriod) => {
        onChange(
            syncRule
                .updateDataSyncPeriod(period)
                .updateDataSyncStartDate(undefined)
                .updateDataSyncEndDate(undefined)
                .updateDataSyncEvents([])
        );
    };

    const updateStartDate = (date: Date | null) => {
        onChange(syncRule.updateDataSyncStartDate(date ?? undefined).updateDataSyncEvents([]));
    };

    const updateEndDate = (date: Date | null) => {
        onChange(syncRule.updateDataSyncEndDate(date ?? undefined).updateDataSyncEvents([]));
    };

    return (
        <React.Fragment>
            <div className={classes.dropdown}>
                <Dropdown
                    label={i18n.t("Period")}
                    items={dropdownItems}
                    value={syncRule.dataSyncPeriod}
                    onValueChange={updatePeriod}
                    hideEmpty={true}
                />
            </div>

            {syncRule.dataSyncPeriod === "FIXED" && (
                <div className={classes.fixedPeriod}>
                    <Typography className={classes.title} variant={"subtitle1"}>
                        {i18n.t("Fixed period")}
                    </Typography>
                    <div className={classes.datePicker}>
                        <DatePicker
                            label={`${i18n.t("Start date")} (*)`}
                            value={syncRule.dataSyncStartDate || null}
                            onChange={updateStartDate}
                        />
                    </div>
                    <div className={classes.datePicker}>
                        <DatePicker
                            label={`${i18n.t("End date")} (*)`}
                            value={syncRule.dataSyncEndDate || null}
                            onChange={updateEndDate}
                        />
                    </div>
                </div>
            )}
        </React.Fragment>
    );
}
