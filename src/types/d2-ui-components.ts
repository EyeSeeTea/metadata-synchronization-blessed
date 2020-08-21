import { Moment } from "moment";
import { SynchronizationType } from "../domain/synchronization/entities/SynchronizationType";

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

export interface SyncReportTableFilters extends TableFilters {
    type: string;
    statusFilter?: string;
    syncRuleFilter?: string;
}

export interface SyncRuleTableFilters extends TableFilters {
    targetInstanceFilter?: string;
    enabledFilter?: string;
    lastExecutedFilter?: Moment | null;
    type?: SynchronizationType;
}

export interface TablePagination {
    page?: number;
    pageSize?: number;
    sorting?: string[];
    paging?: boolean;
}
