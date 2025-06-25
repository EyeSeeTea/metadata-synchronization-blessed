import { Either } from "../common/entities/Either";
import { ModelValidation, validateModel, ValidationError } from "../common/entities/Validations";

export const DEFAULT_HISTORY_RETENTION_DAYS = 30; // Default value for history retention days

export const DEFAULT_SETTINGS: SettingsData = {
    historyRetentionDays: DEFAULT_HISTORY_RETENTION_DAYS,
};

export interface SettingsData {
    historyRetentionDays: number | undefined;
}

export interface SettingsParams {
    historyRetentionDays: string | undefined;
}

export class Settings {
    public readonly historyRetentionDays: number | undefined;

    private constructor(data: SettingsData) {
        this.historyRetentionDays = data.historyRetentionDays;
    }

    static create(data: SettingsParams): Either<ValidationError[], Settings> {
        const validations: ModelValidation[] = data.historyRetentionDays
            ? [
                  {
                      property: "historyRetentionDays",
                      validation: "isNumeric",
                      alias: "Retention days",
                  },
              ]
            : [];

        const errors = validateModel<SettingsParams>(data, validations);

        if (errors.length > 0) {
            return Either.error(errors);
        } else {
            const settings = new Settings({
                historyRetentionDays: data.historyRetentionDays ? Number(data.historyRetentionDays) : undefined,
            });
            return Either.success(settings);
        }
    }
}
