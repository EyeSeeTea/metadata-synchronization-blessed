import React from "react";
import {
    DataElementGroupModel,
    DataElementGroupSetModel,
    DataElementModel,
} from "../../../models/d2Model";
import SyncRule from "../../../models/syncRule";
import MetadataTable from "../../metadata-table/MetadataTable";

interface DataElementsStepProps {
    syncRule: SyncRule;
    onChange: (syncRule: SyncRule) => void;
}

export default function DataElementsSelectionStep(props: DataElementsStepProps) {
    const { syncRule, onChange } = props;

    const changeSelection = (metadataIds: string[]) => {
        onChange(syncRule.updateMetadataIds(metadataIds));
    };

    return (
        <MetadataTable
            models={[DataElementModel, DataElementGroupModel, DataElementGroupSetModel]}
            selection={syncRule.metadataIds}
            notifyNewSelection={changeSelection}
            childrenKeys={["dataElements", "dataElementGroups"]}
        />
    );
}
