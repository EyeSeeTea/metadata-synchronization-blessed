import { makeStyles } from "@material-ui/core";
import { DatePicker } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import moment, { Moment } from "moment";
import React, { useCallback, useMemo } from "react";
import { DataSyncPeriod } from "../../../../../domain/aggregated/entities/DataSyncPeriod";
import i18n from "../../../../../locales";
import { Maybe } from "../../../../../types/utils";
import { availablePeriods, PeriodType } from "../../../../../utils/synchronization";
import Dropdown from "../dropdown/Dropdown";

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
    onFieldChange?<Field extends keyof ObjectWithPeriod>(field: Field, value: ObjectWithPeriod[Field]): void;
    skipPeriods?: Set<PeriodType>;
    className?: string;
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
        className,
    } = props;

    const objectWithPeriod: ObjectWithPeriod = useMemo(
        () => ({
            period: obj.period,
            startDate: obj.startDate ? moment(obj.startDate).toDate() : undefined,
            endDate: obj.endDate ? moment(obj.endDate).toDate() : undefined,
        }),
        [obj]
    );

    const { period, startDate, endDate } = objectWithPeriod;

    const classes = useStyles();

    const periodItems = useMemo(
        () =>
            _(availablePeriods)
                .mapValues((value, key) => ({ ...value, id: key }))
                .values()
                .filter(period => !skipPeriods.has(period.id as PeriodType))
                .value(),
        [skipPeriods]
    );

    const updatePeriod = useCallback(
        (period: ObjectWithPeriodInput["period"]) => {
            onChange({ ...objectWithPeriod, period });
            onFieldChange("period", period);
        },
        [objectWithPeriod, onChange, onFieldChange]
    );

    const updateStartDate = useCallback(
        (startDateM: Maybe<Moment>) => {
            const startDate = startDateM?.toDate();
            onChange({ ...objectWithPeriod, startDate });
            onFieldChange("startDate", startDate);
        },
        [objectWithPeriod, onChange, onFieldChange]
    );

    const updateEndDate = useCallback(
        (endDateM: Maybe<Moment>) => {
            const endDate = endDateM?.toDate();
            onChange({ ...objectWithPeriod, endDate });
            onFieldChange("endDate", endDate);
        },
        [objectWithPeriod, onChange, onFieldChange]
    );

    return (
        <div className={className}>
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
                        <DatePicker label={`${i18n.t("End date")}`} value={endDate || null} onChange={updateEndDate} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeriodSelection;
