import { Maybe } from "../../../types/utils";
import { Struct } from "../../common/entities/Struct";
import { SynchronizationStats } from "./SynchronizationResult";

export class Stats extends Struct<SynchronizationStats>() {
    static combine(stats: Stats[]): Stats {
        return stats.reduce((acum, stat) => {
            return Stats.create({
                imported: acum.imported + stat.imported,
                ignored: acum.ignored + stat.ignored,
                updated: acum.updated + stat.updated,
                deleted: acum.deleted + stat.deleted,
                total: (acum.total || 0) + stat.imported + stat.deleted + stat.ignored + stat.updated,
            });
        }, Stats.createOrEmpty());
    }

    static createOrEmpty(stats?: Partial<SynchronizationStats>): Stats {
        return Stats.create({ imported: 0, ignored: 0, updated: 0, total: 0, deleted: 0, ...stats });
    }

    static sumStats(stats1: SynchronizationStats, stats2: Maybe<SynchronizationStats>): Stats {
        return Stats.create({
            deleted: stats1.deleted + (stats2?.deleted || 0),
            ignored: stats1.ignored + (stats2?.ignored || 0),
            imported: stats1.imported + (stats2?.imported || 0),
            updated: stats1.updated + (stats2?.updated || 0),
            total: (stats1?.total || 0) + (stats2?.total || 0),
        });
    }
}
