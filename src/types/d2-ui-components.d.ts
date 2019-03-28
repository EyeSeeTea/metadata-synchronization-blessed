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
    date?: Moment;
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
