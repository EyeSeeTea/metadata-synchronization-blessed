import { Struct } from "../../common/entities/Struct";

type StatsAttrs = {
    imported: number;
    ignored: number;
    updated: number;
    deleted: number;
    total: number;
};

export class Stats extends Struct<StatsAttrs>() {
    static combine(stats: Stats[]): Stats {
        return stats.reduce((acum, stat) => {
            return Stats.create({
                imported: acum.imported + stat.imported,
                ignored: acum.ignored + stat.ignored,
                updated: acum.updated + stat.updated,
                deleted: acum.deleted + stat.deleted,
                total: acum.total + stat.imported + stat.deleted + stat.ignored + stat.updated,
            });
        }, Stats.createOrEmpty());
    }

    static createOrEmpty(stats?: Partial<StatsAttrs>): Stats {
        return Stats.create({ imported: 0, ignored: 0, updated: 0, total: 0, deleted: 0, ...stats });
    }
}
