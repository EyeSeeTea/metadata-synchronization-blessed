import { useEffect, useState } from "react";
import { AppContextState } from "../../contexts/AppContext";

export function useDeleteHistory(appContext: AppContextState | null) {
    const [deletingHistory, setDeletingHistory] = useState<boolean | undefined>();

    useEffect(() => {
        setDeletingHistory(true);

        appContext?.compositionRoot.reports
            .deleteOld()
            .then(() => setDeletingHistory(false))
            .catch(error => {
                console.debug(error);
                setDeletingHistory(false);
            });
    }, [appContext?.compositionRoot.reports]);

    return { deletingHistory };
}
