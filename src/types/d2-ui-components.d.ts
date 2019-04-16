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
    search?: string;
    lastUpdatedDate?: Moment;
    groupFilter?: string;
    levelFilter?: string;
    customFilters?: string[];
    customFields?: string[];
}

export interface TablePagination {
    page?: number;
    pageSize?: number;
    sorting?: string[];
    paging?: boolean;
}

export interface TableLabel {
    name: string;
    text: string;
}
