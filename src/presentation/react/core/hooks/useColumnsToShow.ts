import { useMemo } from "react";
import _ from "lodash";
import { ReferenceObject, TableColumn } from "@eyeseetea/d2-ui-components";

export function useColumnsToShow<T extends ReferenceObject>(
    tableColumns: TableColumn<T>[],
    visibleColumns: string[] | undefined
) {
    const columnsToShow = useMemo(() => {
        if (!visibleColumns || _.isEmpty(visibleColumns)) return tableColumns;

        const indexes = _(visibleColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(tableColumns)
            .map(column => ({ ...column, hidden: !visibleColumns.includes(column.name as string) }))
            .sortBy(column => indexes[column.name as string])
            .value();
    }, [visibleColumns, tableColumns]);

    return { columnsToShow: columnsToShow };
}
