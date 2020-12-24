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
    fields?: string[];
    lastUpdatedDate?: Moment;
    groupFilter?: string;
    customFilters?: string[];
    customFields?: string[];
    metadataType?: string;
}

export interface TablePagination {
    page?: number;
    pageSize?: number;
    sorting?: string[];
    paging?: boolean;
}
