import _ from "lodash";
import { Pager } from "../types/d2-api";
import { PartialBy } from "../types/utils";

export function paginate<T>(objects: T[], options: { page: number; pageSize: number }): { objects: T[]; pager: Pager } {
    const { page, pageSize } = options;
    const total = objects.length;
    const pageCount = Math.ceil(objects.length / pageSize);
    const firstItem = (page - 1) * pageSize;
    const lastItem = firstItem + pageSize;
    const paginatedObjects = _.slice(objects, firstItem, lastItem);
    const pager: Pager = { page, pageSize, pageCount, total };
    return { objects: paginatedObjects, pager };
}

type PartialPager = Omit<PartialBy<Pager, "total" | "pageCount">, "page">;

/**
 * Calculates the total number of pages based on the total number of items and the page size.
 * If `pageCount` is provided, it will be returned directly.
 *
 * Use only when needed - `pageCount` is already returned by the DHIS2 API in paginated responses
 * but not reflected in current d2-api version typings for all endpoints
 *  */
export function getPageCount({ pageSize, total, pageCount }: PartialPager): number {
    if (typeof pageCount === "number") {
        return pageCount;
    }
    if (!total || pageSize === 0) {
        return 0; // matches observed dhis2 api behavior
    }
    return Math.ceil(total / pageSize);
}

/**
 * Returns an array of page indexes, omitting the first page
 */
export function getRemainingPages(pager: PartialPager): number[] {
    const pageCount = getPageCount(pager);
    if (pageCount < 2) {
        return [];
    }
    return _.range(2, pageCount + 1);
}
