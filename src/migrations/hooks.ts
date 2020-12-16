import { D2Api } from "d2-api/2.30";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MigrationsRunner } from "./index";
import { getMigrationTasks } from "./tasks";

export type MigrationsState =
    | { type: "checking" }
    | { type: "pending"; runner: MigrationsRunner }
    | { type: "checked" };

export interface UseMigrationsResult {
    state: MigrationsState;
    onFinish: () => void;
}

export function useMigrations(api: D2Api, dataStoreNamespace: string): UseMigrationsResult {
    const [state, setState] = useState<MigrationsState>({ type: "checking" });
    const onFinish = useCallback(() => setState({ type: "checked" }), [setState]);

    useEffect(() => {
        runMigrations(api, dataStoreNamespace).then(setState);
    }, [api, dataStoreNamespace]);

    const result = useMemo(() => ({ state, onFinish }), [state, onFinish]);

    return result;
}

async function runMigrations(api: D2Api, dataStoreNamespace: string): Promise<MigrationsState> {
    const runner = await MigrationsRunner.init({
        api,
        debug: console.log,
        migrations: await getMigrationTasks(),
        dataStoreNamespace,
    });

    if (runner.hasPendingMigrations()) {
        return { type: "pending", runner };
    } else {
        return { type: "checked" };
    }
}
