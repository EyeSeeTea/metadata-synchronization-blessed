import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../contexts/AppContext";

export default function useListColumns(nameSpace: string) {
    const { compositionRoot } = useAppContext();
    const [visibleColumns, setVisibleColumns] = useState<string[]>();

    useEffect(() => {
        compositionRoot.tableColumns.getColumns(nameSpace).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot, nameSpace]);

    const saveReorderedColumns = useCallback(
        async (columnKeys: string[]) => {
            if (!visibleColumns) return;

            await compositionRoot.tableColumns.saveColumns(nameSpace, columnKeys);
        },
        [compositionRoot, nameSpace, visibleColumns]
    );

    return {
        visibleColumns: visibleColumns,
        saveReorderedColumns: saveReorderedColumns,
    };
}
