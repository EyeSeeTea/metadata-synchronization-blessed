import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import { useColumnsToShow } from "./useColumnsToShow";
import { ReferenceObject, TableColumn } from "@eyeseetea/d2-ui-components";

export default function useTableColumns<T extends ReferenceObject>(nameSpace: string, tableColumns: TableColumn<T>[]) {
    const { compositionRoot } = useAppContext();
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const { columnsToShow } = useColumnsToShow(tableColumns, visibleColumns);

    useEffect(() => {
        compositionRoot.tableColumns.getColumns(nameSpace).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot.tableColumns, nameSpace]);

    const saveReorderedColumns = useCallback(
        async (columnKeys: string[]) => {
            if (!visibleColumns) return;

            await compositionRoot.tableColumns.saveColumns(nameSpace, columnKeys);
        },
        [compositionRoot.tableColumns, nameSpace, visibleColumns]
    );

    return {
        columnsToShow: columnsToShow,
        saveReorderedColumns: saveReorderedColumns,
    };
}
