import React, { useCallback, useEffect } from "react";

import { useAppContext } from "../../../../react/core/contexts/AppContext";
import { UserSettings } from "../../../../../domain/user-settings/UserSettings";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { includeObjectsAndReferencesOptions } from "../../../../react/core/components/sync-wizard/metadata/useMetadataIncludeExcludeStep";

export function useUserSettings() {
    const { newCompositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [userSettings, setUserSettings] = React.useState<UserSettings>(UserSettings.default());

    const updateUserSettingsInclusionConfig = useCallback(
        <K extends keyof UserSettings["inclusionConfig"]>(key: K, value: UserSettings["inclusionConfig"][K]) => {
            if (!userSettings) return;
            else {
                setUserSettings(userSettings => userSettings?.updateInclusionConfig(key, value));
            }
        },
        [userSettings]
    );

    const saveUserSettings = useCallback(() => {
        if (!userSettings) return;
        else {
            return newCompositionRoot.userSettings.save
                .execute(userSettings)
                .toPromise()
                .then(() => snackbar.info("User settings saved successfully!"))
                .catch(error => {
                    console.error(`error saving user settings:  ${error}`);
                    snackbar.error("Error saving user settings. Please try again later.");
                });
        }
    }, [newCompositionRoot, userSettings, snackbar]);

    useEffect(() => {
        return newCompositionRoot.userSettings.get.execute().run(
            userSettings => setUserSettings(userSettings),
            error => {
                console.error(`error fetching user settings:  ${error}`);
                snackbar.error("Error fetching user settings. Please try again later.");
            }
        );
    }, [newCompositionRoot, snackbar]);

    return {
        userSettings,
        updateUserSettingsInclusionConfig,
        saveUserSettings,
        inclusionOptions: includeObjectsAndReferencesOptions,
    };
}
