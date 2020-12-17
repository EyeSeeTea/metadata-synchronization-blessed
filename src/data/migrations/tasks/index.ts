import { Migration, MigrationWithVersion, MigrationTasks } from "../client/types";

function migration(
    version: number,
    migration: Migration<MigrationParams>
): MigrationWithVersion<MigrationParams> {
    return { version, ...migration };
}

export async function getMigrationTasks(): Promise<MigrationTasks<MigrationParams>> {
    return [
        migration(1, (await import("./01.instances-by-id")).default),
        migration(2, (await import("./02.rules-by-id")).default),
        migration(3, (await import("./03.sync-reports")).default),
        migration(4, (await import("./04.history-notifications")).default),
        migration(5, (await import("./05.multiple-stores")).default),
        migration(6, (await import("./06.this-instance")).default),
    ];
}

export interface MigrationParams {
    baseUrl: string;
}
