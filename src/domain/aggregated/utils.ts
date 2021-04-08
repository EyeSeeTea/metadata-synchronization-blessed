import moment, { Moment } from "moment";
import { availablePeriods } from "../../utils/synchronization";
import { DataSynchronizationParams } from "./entities/DataSynchronizationParams";

export function buildPeriodFromParams(
    params: Pick<DataSynchronizationParams, "period" | "startDate" | "endDate">
): { startDate: Moment; endDate: Moment } {
    const { period, startDate, endDate } = params;

    if (!period || period === "ALL" || period === "FIXED") {
        return {
            startDate: moment(startDate ?? "1970-01-01"),
            endDate: moment(endDate ?? moment().add(1, "years").endOf("year").format("YYYY-MM-DD")),
        };
    } else if (period === "SINCE_LAST_EXECUTED_DATE") {
        return {
            startDate: moment(startDate ?? "1970-01-01"),
            endDate: moment(),
        };
    }

    const { start, end = start } = availablePeriods[period];
    if (start === undefined || end === undefined) throw new Error("Unsupported period provided");

    const [startAmount, startType] = start;
    const [endAmount, endType] = end;

    return {
        startDate: moment().subtract(startAmount, startType).startOf(startType),
        endDate: moment().subtract(endAmount, endType).endOf(endType),
    };
}
