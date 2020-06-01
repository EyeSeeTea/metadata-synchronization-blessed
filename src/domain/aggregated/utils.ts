import moment, { Moment } from "moment";
import { availablePeriods } from "../../utils/synchronization";
import { DataSynchronizationParams } from "./types";

export function buildPeriodFromParams(params: DataSynchronizationParams): [Moment, Moment] {
    const {
        period,
        startDate = "1970-01-01",
        endDate = moment()
            .add(1, "years")
            .endOf("year")
            .format("YYYY-MM-DD"),
    } = params;

    if (!period || period === "ALL" || period === "FIXED") {
        return [moment(startDate), moment(endDate)];
    } else {
        const { start, end = start } = availablePeriods[period];
        if (start === undefined || end === undefined)
            throw new Error("Unsupported period provided");

        const [startAmount, startType] = start;
        const [endAmount, endType] = end;

        return [
            moment()
                .subtract(startAmount, startType as moment.unitOfTime.DurationConstructor)
                .startOf(startType as moment.unitOfTime.DurationConstructor),
            moment()
                .subtract(endAmount, endType as moment.unitOfTime.DurationConstructor)
                .endOf(endType as moment.unitOfTime.DurationConstructor),
        ];
    }
}
