export interface ObjectsTableList<T> {
    objects: T[];
    pager: {
        total: number;
    };
}

export interface ObjectsTableFilters {
    search: string;
}

export interface ObjectsTablePagination {
    page: number;
    pageSize: number;
    sorting: {
        field: string;
        direction: string;
    };
}