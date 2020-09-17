import React from "react";
import { SyncWizardStepProps } from "../Steps";
import FilterRulesTable, { FilterRulesTableProps } from "../../filter-rules-table/FilterRulesTable";

const MetadataFilterRulesStep: React.FC<SyncWizardStepProps> = props => {
    const { syncRule, onChange } = props;
    const setFilterRules = React.useCallback<FilterRulesTableProps["onChange"]>(
        filterRules => {
            onChange(syncRule.updateFilterRules(filterRules));
        },
        [syncRule, onChange]
    );

    return <FilterRulesTable filterRules={syncRule.filterRules} onChange={setFilterRules} />;
};

export default React.memo(MetadataFilterRulesStep);
