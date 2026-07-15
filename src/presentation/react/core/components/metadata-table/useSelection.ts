import { useEffect, useState } from "react";
import { DataSource } from "../../../../../domain/instance/entities/DataSource";
import { MetadataEntities } from "../../../../../domain/metadata/entities/MetadataEntities";
import { useAppContext } from "../../contexts/AppContext";
import _ from "lodash";

export function useSelection(
    collectionName: keyof MetadataEntities,
    ids: string[],
    selectedIds: string[],
    remoteInstance: DataSource | undefined
) {
    const { compositionRoot } = useAppContext();
    const [otherTypeCountFallback, setOtherTypeCountFallback] = useState(0);

    // The current type's full id list (`ids`) is never loaded for organisationUnits,
    // so we cannot tell cross-type selections apart by set difference. Resolve the
    // selection's types via the API and count items in any collection other than
    // the current one.
    useEffect(() => {
        if (collectionName !== "organisationUnits" || selectedIds.length === 0) {
            setOtherTypeCountFallback(0);
            return;
        }

        compositionRoot.metadata
            .getByIds(selectedIds, remoteInstance, "id")
            .then(pkg => setOtherTypeCountFallback(countPackageOtherType(pkg, collectionName)));
    }, [collectionName, selectedIds, compositionRoot, remoteInstance]);

    const idSet = ids.length > 0 ? new Set(ids) : undefined;
    const selection = (idSet ? selectedIds.filter(id => idSet.has(id)) : selectedIds).map(id => ({
        id,
        checked: true,
        indeterminate: false,
    }));

    const crossTypeCount = idSet ? selectedIds.filter(id => !idSet.has(id)).length : otherTypeCountFallback;

    return { selection, crossTypeCount };
}

function countPackageOtherType(pkg: Partial<Record<string, unknown[]>>, currentCollection: string): number {
    return _.sumBy(Object.entries(pkg), ([collection, items]) =>
        collection === currentCollection || !items ? 0 : items.length
    );
}
