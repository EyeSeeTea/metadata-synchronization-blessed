import _ from "lodash";
import { Pager } from "../types/d2-api";

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
