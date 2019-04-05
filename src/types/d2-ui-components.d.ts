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
    customFilters?: (string | null)[];
    customFields?: string[];
}

export interface OrganisationUnitTableFilters extends TableFilters {
    orgUnitGroup?: string;
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
