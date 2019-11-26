import { useD2 } from "d2-api";
import { withSnackbar } from "d2-ui-components";
import React from "react";
import SyncRule from "../../../models/syncRule";
import MetadataTable from "../../metadata-table/MetadataTable";

interface DataElementsStepProps {
    syncRule: SyncRule;
    //snackbar: PropTypes.object.isRequired,
    onChange: () => void;
}

const changeSelection = (metadataIds: string[]) => {
    console.log(`change selection ${metadataIds}`);
};

export default function DataElementsSelectionStep(props: DataElementsStepProps) {
    const { syncRule, ...rest } = props;
    const d2 = useD2();

    const component = (
        <MetadataTable
            d2={d2}
            notifyNewSelection={changeSelection}
            initialSelection={[]}
            models={[]}
            {...rest}
        />
    );

    return withSnackbar(component);
}
