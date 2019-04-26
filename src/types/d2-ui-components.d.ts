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
}

export interface OrganisationUnitTableFilters extends TableFilters {
    orgUnitLevel?: string;
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
