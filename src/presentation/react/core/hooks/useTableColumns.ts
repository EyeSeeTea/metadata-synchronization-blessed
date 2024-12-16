import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../contexts/AppContext";

export default function useTableColumns(nameSpace: string) {
    const { compositionRoot } = useAppContext();
    const [visibleColumns, setVisibleColumns] = useState<string[]>();

    useEffect(() => {
        compositionRoot.tableColumns.getColumns(nameSpace).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot.tableColumns, nameSpace]);

    console.log({ visibleColumns });

    const saveReorderedColumns = useCallback(
        async (columnKeys: string[]) => {
            if (!visibleColumns) return;

            await compositionRoot.tableColumns.saveColumns(nameSpace, columnKeys);
        },
        [compositionRoot.tableColumns, nameSpace, visibleColumns]
    );

    return {
        visibleColumns: visibleColumns,
        saveReorderedColumns: saveReorderedColumns,
    };
}
