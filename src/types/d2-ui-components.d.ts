export interface TableList<T> {
    objects: T[];
    pager: {
        total: number;
    };
}

export interface TableFilters {
    search: string;
}

export interface TablePagination {
    page: number;
    pageSize: number;
    sorting: {
        field: string;
        direction: string;
    };
}