import { Struct } from "../common/entities/Struct";

export const DEFAULT_INCLUSION_MODE = "includeObjectsAndReferences";
export const DEFAULT_USER_SETTINGS: UserSettingsProps = {
    inclusionConfig: {
        sharing: DEFAULT_INCLUSION_MODE,
        users: DEFAULT_INCLUSION_MODE,
        organisationUnits: DEFAULT_INCLUSION_MODE,
    },
};

const inclusionModes = ["includeObjectsAndReferences", "includeOnlyReferences", "removeObjectsAndReferences"] as const;

export type InclusionMode = typeof inclusionModes[number];

export type UserSettingsProps = {
    inclusionConfig: {
        sharing: InclusionMode;
        users: InclusionMode;
        organisationUnits: InclusionMode;
    };
};
export type UserSettingsInclusionsConfig = UserSettingsProps["inclusionConfig"];

export class UserSettings extends Struct<UserSettingsProps>() {
    updateInclusionConfig<K extends keyof UserSettings["inclusionConfig"]>(
        key: K,
        value: UserSettings["inclusionConfig"][K]
    ): UserSettings {
        return this._update({ inclusionConfig: { ...this.inclusionConfig, [key]: value } });
    }

    static default(): UserSettings {
        return UserSettings.create(DEFAULT_USER_SETTINGS);
    }
}
