import moment, { Moment } from "moment";
import _ from "lodash";
import { availablePeriods } from "../../utils/synchronization";
import { DataSynchronizationParams } from "./entities/DataSynchronizationParams";

/* For a map of relationships (child -> parent[]), return the minimum array of parents
   that include all of the children.

   Implementation: Invert the original relationship and, on every iteration,
   sort the pairs by the length of children, until all children have been seen.
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
    let maximum: { parent: string; children: string[] } | undefined;

    while ((maximum = getRelationshipWithLongestChildren(relationshipPairs))) {
        const { parent: maxParent, children: maxChildren } = maximum;

        outputParents.push(maxParent);
        maxChildren.forEach(child => childrenSeen.add(child));

        // Remove seen children from all the relationships
        relationshipPairs.forEach(([_parent, children]) => {
            maxChildren.forEach(maxChild => {
                children.delete(maxChild);
            });
        });
    }

    return outputParents;
}

function getRelationshipWithLongestChildren(
    relationshipPairs: Array<[string, Set<string>]>
): { parent: string; children: string[] } | undefined {
    const maximum = _.maxBy(relationshipPairs, ([_parent, children]) => children.size);
    if (!maximum) return;
    const [parent, children] = maximum;
    return children.size > 0 ? { parent, children: Array.from(children) } : undefined;
}

export function buildPeriodFromParams(params: Pick<DataSynchronizationParams, "period" | "startDate" | "endDate">): {
    startDate: Moment;
    endDate: Moment;
} {
    const { period, startDate, endDate } = params;

    if (!period || period === "ALL" || period === "FIXED") {
        return {
            startDate: moment(startDate ?? "1970-01-01"),
            endDate: moment(endDate ?? moment().add(1, "years").endOf("year").format("YYYY-MM-DD")),
        };
    } else if (period === "SINCE_LAST_EXECUTED_DATE") {
        return {
            startDate: moment(startDate ?? "1970-01-01"),
            endDate: moment(),
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
