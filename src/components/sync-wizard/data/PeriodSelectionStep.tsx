import i18n from "@dhis2/d2-i18n";
import { makeStyles } from "@material-ui/core";
import { DatePicker } from "d2-ui-components";
import _ from "lodash";
import React from "react";
import { DataSyncPeriod } from "../../../types/synchronization";
import { availablePeriods } from "../../../utils/synchronization";
import Dropdown from "../../dropdown/Dropdown";
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

const PeriodSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
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

    const periodItems = _(availablePeriods)
        .mapValues((value, key) => ({ ...value, id: key }))
        .values()
        .value();

    return (
        <React.Fragment>
            <div className={classes.dropdown}>
                <Dropdown
                    label={i18n.t("Period")}
                    items={periodItems}
                    value={syncRule.dataSyncPeriod}
                    onValueChange={updatePeriod}
                    hideEmpty={true}
                />
            </div>

            {syncRule.dataSyncPeriod === "FIXED" && (
                <div className={classes.fixedPeriod}>
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
};

export default PeriodSelectionStep;
