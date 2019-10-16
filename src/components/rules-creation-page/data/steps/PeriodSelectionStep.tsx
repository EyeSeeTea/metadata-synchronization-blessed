import React from "react";
import { withSnackbar } from "d2-ui-components";

import { D2Api } from "../../../../types/d2";
import SyncRule from "../../../../models/syncRule";

interface DataElementsSelectionStepProps {
    d2: D2Api;
    syncRule: SyncRule;
    //snackbar: PropTypes.object.isRequired,
    onChange: () => void;
}

export default function PeriodSelectionStep(_props: DataElementsSelectionStepProps) {
    //const { d2, syncRule, ...rest } = props;

    const component = <span>Period</span>;

    return withSnackbar(component);
}
