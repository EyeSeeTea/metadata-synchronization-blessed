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

export interface OrganisationUnitTableFilters extends TableFilters {
    levelFilter?: string;
}

export interface SyncReportTableFilters extends TableFilters {
    statusFilter?: string;
}

export interface SyncRuleTableFilters extends TableFilters {
    targetInstanceFilter?: string;
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
