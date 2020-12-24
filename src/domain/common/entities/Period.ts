import { DataSyncPeriod } from "../../aggregated/types";
import { Either } from "./Either";
import { ModelValidation, validateModel, ValidationError } from "./Validations";

interface PeriodData {
    type: DataSyncPeriod;
    startDate?: Date;
    endDate?: Date;
}

export class Period {
    public readonly type: DataSyncPeriod;
    public readonly startDate?: Date;
    public readonly endDate?: Date;

    private constructor(data: PeriodData) {
        this.type = data.type;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
    }

    static create({ type, startDate, endDate }: PeriodData): Either<ValidationError[], Period> {
        const validations: ModelValidation[] =
            type === "FIXED"
                ? [
                      {
                          property: "startDate",
                          validation: "hasValue",
                          alias: "start date",
                      },
                      {
                          property: "endDate",
                          validation: "hasValue",
                          alias: "end date",
                      },
                  ]
                : [];

        const newPeriod = new Period({
            type: type ?? "ALL",
            startDate,
            endDate,
        });

        const errors = validateModel<Period>(newPeriod, validations);

        return errors.length > 0 ? Either.error(errors) : Either.success(newPeriod);
    }

    static createDefault() {
        return new Period({ type: "ALL" });
    }
}
