import React, { useCallback } from "react";
import FilterRulesTable, { FilterRulesTableProps } from "../../filter-rules-table/FilterRulesTable";
import { SyncWizardStepProps } from "../Steps";

const MetadataFilterRulesStep: React.FC<SyncWizardStepProps> = props => {
    const { syncRule, onChange } = props;
    const setFilterRules = useCallback<FilterRulesTableProps["onChange"]>(
        filterRules => {
            onChange(syncRule.updateFilterRules(filterRules));
        },
        [syncRule, onChange]
    );

    return <FilterRulesTable filterRules={syncRule.filterRules} onChange={setFilterRules} />;
};

export default React.memo(MetadataFilterRulesStep);
