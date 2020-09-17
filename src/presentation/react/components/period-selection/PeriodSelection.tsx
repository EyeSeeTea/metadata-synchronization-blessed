import React from "react";
import { makeStyles } from "@material-ui/core";
import { DatePicker } from "d2-ui-components";
import _ from "lodash";
import { DataSyncPeriod } from "../../../../domain/aggregated/types";
import { availablePeriods, PeriodType } from "../../../../utils/synchronization";
import Dropdown from "../dropdown/Dropdown";
import i18n from "../../../../locales";
import { Moment } from "moment";
import moment from "moment";
import { Maybe } from "../../../../types/utils";

export interface ObjectWithPeriodInput {
    period: DataSyncPeriod;
    startDate?: Date | string;
    endDate?: Date | string;
}

export interface ObjectWithPeriod {
    period: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
}

export interface PeriodSelectionProps {
    periodTitle?: string;
    objectWithPeriod: ObjectWithPeriodInput;
    onChange?: (obj: ObjectWithPeriod) => void;
    onFieldChange?<Field extends keyof ObjectWithPeriod>(
        field: Field,
        value: ObjectWithPeriod[Field]
    ): void;
    skipPeriods?: Set<PeriodType>;
}

export type OnChange = Required<PeriodSelectionProps>["onChange"];
export type OnFieldChange = Required<PeriodSelectionProps>["onFieldChange"];

const useStyles = makeStyles({
    dropdown: {
        marginTop: 20,
        marginLeft: 0,
    },
    fixedPeriod: {
        marginTop: 5,
        marginBottom: -20,
        marginLeft: 10,
    },
    datePicker: {
        marginTop: -10,
    },
});

const PeriodSelection: React.FC<PeriodSelectionProps> = props => {
    const {
        objectWithPeriod: obj,
        onChange = _.noop as OnChange,
        onFieldChange = _.noop as OnFieldChange,
        skipPeriods = new Set(),
        periodTitle = i18n.t("Period"),
    } = props;

    const objectWithPeriod: ObjectWithPeriod = {
        period: obj.period,
        startDate: obj.startDate ? moment(obj.startDate).toDate() : undefined,
        endDate: obj.endDate ? moment(obj.endDate).toDate() : undefined,
    };
    const { period, startDate, endDate } = objectWithPeriod;

    const classes = useStyles();

    const periodItems = React.useMemo(
        () =>
            _(availablePeriods)
                .mapValues((value, key) => ({ ...value, id: key }))
                .values()
                .filter(period => !skipPeriods.has(period.id as PeriodType))
                .value(),
        [skipPeriods]
    );

    const updatePeriod = React.useCallback(
        (period: ObjectWithPeriodInput["period"]) => {
            onChange({ ...objectWithPeriod, period });
            onFieldChange("period", period);
        },
        [objectWithPeriod, onChange, onFieldChange]
    );

    const updateStartDate = React.useCallback(
        (startDateM: Maybe<Moment>) => {
            const startDate = startDateM?.toDate();
            onChange({ ...objectWithPeriod, startDate });
            onFieldChange("startDate", startDate);
        },
        [objectWithPeriod, onChange, onFieldChange]
    );

    const updateEndDate = React.useCallback(
        (endDateM: Maybe<Moment>) => {
            const endDate = endDateM?.toDate();
            onChange({ ...objectWithPeriod, endDate });
            onFieldChange("endDate", endDate);
        },
        [objectWithPeriod, onChange, onFieldChange]
    );

    return (
        <React.Fragment>
            <div className={classes.dropdown}>
                <Dropdown
                    label={periodTitle}
                    items={periodItems}
                    value={period || null}
                    onValueChange={updatePeriod}
                    hideEmpty={true}
                />
            </div>

            {period === "FIXED" && (
                <div className={classes.fixedPeriod}>
                    <div className={classes.datePicker}>
                        <DatePicker
                            label={`${i18n.t("Start date")}`}
                            value={startDate || null}
                            onChange={updateStartDate}
                        />
                    </div>
                    <div className={classes.datePicker}>
                        <DatePicker
                            label={`${i18n.t("End date")}`}
                            value={endDate || null}
                            onChange={updateEndDate}
                        />
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

export default PeriodSelection;
