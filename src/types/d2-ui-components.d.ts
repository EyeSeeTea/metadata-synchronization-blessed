import { Moment } from "moment";

export interface TableList {
    objects: any[];
    pager: {
        total: number;
        page: number;
        pageCount?: number;
    };
}

export interface TableFilters {
    search: string;
    lastUpdatedDate?: Moment;
    orgUnitGroup?: string;
    d2Filters: (string | null)[];
}

export interface TablePagination {
    page: number;
    pageSize: number;
    sorting: string[];
}

export interface TableLabel {
    name: string;
    text: string;
}
