import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../contexts/AppContext";

export interface MigrationsState {
    type: "checking" | "pending" | "checked";
}

export interface UseMigrationsResult {
    state: MigrationsState;
    onFinish: () => void;
}

export function useMigrations(): UseMigrationsResult {
    const { compositionRoot } = useAppContext();

    const [state, setState] = useState<MigrationsState>({ type: "checking" });
    const onFinish = useCallback(() => setState({ type: "checked" }), [setState]);

    useEffect(() => {
        compositionRoot.migrations
            .hasPending()
            .then(pendingMigrations =>
                setState({ type: pendingMigrations ? "pending" : "checked" })
            );
    }, [compositionRoot]);

    const result = useMemo(() => ({ state, onFinish }), [state, onFinish]);

    return result;
}
