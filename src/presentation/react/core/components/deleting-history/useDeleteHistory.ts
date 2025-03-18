import { useEffect, useState } from "react";
import { AppContextState } from "../../contexts/AppContext";

export function useDeleteHistory(appContext: AppContextState | null) {
    const [deletingHistory, setDeletingHistory] = useState<boolean | undefined>();

    useEffect(() => {
        if (!appContext) return;
        appContext.newCompositionRoot.settings.get.execute().run(
            settings => {
                if (settings.historyRetentionDays) {
                    setDeletingHistory(true);

                    appContext.compositionRoot.reports
                        .deleteOld()
                        .then(() => setDeletingHistory(false))
                        .catch(error => {
                            console.debug(error);
                            setDeletingHistory(false);
                        });
                }
            },
            error => {
                console.error(`error fetching settings in useDeleteHistory :  ${error}`);
            }
        );
    }, [appContext]);

    return { deletingHistory };
}
