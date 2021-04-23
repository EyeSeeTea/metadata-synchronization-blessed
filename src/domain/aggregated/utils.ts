import moment, { Moment } from "moment";
import _ from "lodash";
import { availablePeriods } from "../../utils/synchronization";
import { DataSynchronizationParams } from "./types";

/* For a map of relationship (child -> parent[]), return the minimum array of parents
   that include all of the children.

   Implementation: Invert the original relationship to parent -> child[], and, for every
   iteration, sort the pairs by length of children, until all children are seen.
*/
export function getMinimumParents(relationships: Map<string, string[]>): string[] {
    const relationshipPairs = _(Array.from(relationships))
        .flatMap(([child, parent]) => parent.map(parent => ({ child, parent })))
        .groupBy(obj => obj.parent)
        .mapValues(objs => new Set(objs.map(obj => obj.child)))
        .toPairs()
        .value();

    const outputParents: string[] = [];
    const childrenSeen = new Set<string>();

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const maximum = _.maxBy(relationshipPairs, ([_parent, children]) => children.size);
        if (!maximum) break;

        const [maxParent, maxChildren] = maximum;
        if (maxChildren.size === 0) break;

        const maxChildrenArray = Array.from(maxChildren);

        outputParents.push(maxParent);
        maxChildrenArray.forEach(child => childrenSeen.add(child));

        // Remove seen children from all the relationships
        relationshipPairs.forEach(([_parent, children]) => {
            maxChildrenArray.forEach(maxChild => {
                children.delete(maxChild);
            });
        });
    }

    return outputParents;
}

export function buildPeriodFromParams(
    params: Pick<DataSynchronizationParams, "period" | "startDate" | "endDate">
): { startDate: Moment; endDate: Moment } {
    const { period, startDate, endDate } = params;

    if (!period || period === "ALL" || period === "FIXED") {
        return {
            startDate: moment(startDate ?? "1970-01-01"),
            endDate: moment(endDate ?? moment().add(1, "years").endOf("year").format("YYYY-MM-DD")),
        };
    }

    const { start, end = start } = availablePeriods[period];
    if (start === undefined || end === undefined) throw new Error("Unsupported period provided");

    const [startAmount, startType] = start;
    const [endAmount, endType] = end;

    return {
        startDate: moment().subtract(startAmount, startType).startOf(startType),
        endDate: moment().subtract(endAmount, endType).endOf(endType),
    };
}
