import i18n from "@dhis2/d2-i18n";
import { useD2, useD2Api, useD2ApiData } from "d2-api";
import { MultiSelector } from "d2-ui-components";
import _ from "lodash";
import React, { useMemo, useState } from "react";
import { Toggle } from "../../toggle/Toggle";
import { SyncWizardStepProps } from "../Steps";

const CategoryOptionsSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const d2 = useD2();
    const api = useD2Api();
    const [selection, updateSelection] = useState<string[]>(
        syncRule.dataSyncAttributeCategoryOptions
    );

    const updateSyncAll = (value: boolean) => {
        onChange(
            syncRule
                .updateDataSyncAllAttributeCategoryOptions(value)
                .updateDataSyncAttributeCategoryOptions(undefined)
        );
    };

    const { data } = useD2ApiData(
        api.models.categoryOptionCombos.get({
            paging: false,
            fields: { id: true, name: true },
            filter: {
                "categoryCombo.dataDimensionType": { eq: "ATTRIBUTE" },
            },
        })
    );

    const options = useMemo(
        () =>
            _.uniqBy(
                _.map(data?.objects ?? [], ({ name }) => ({ value: name, text: name })),
                "value"
            ),
        [data]
    );

    const changeAttributeCategoryOptions = (selectedItems: string[]) => {
        const attributeCategoryOptions = _(selectedItems)
            .map(name => _.filter(data?.objects, { name }))
            .flatten()
            .map(({ id }) => id)
            .value();

        updateSelection(selectedItems);
        onChange(syncRule.updateDataSyncAttributeCategoryOptions(attributeCategoryOptions));
    };

    return (
        <React.Fragment>
            <Toggle
                label={i18n.t("Sync all attribute category options")}
                value={syncRule.dataSyncAllAttributeCategoryOptions}
                onValueChange={updateSyncAll}
            />
            {!syncRule.dataSyncAllAttributeCategoryOptions && (
                <MultiSelector
                    d2={d2}
                    height={300}
                    onChange={changeAttributeCategoryOptions}
                    options={options}
                    selected={selection}
                />
            )}
        </React.Fragment>
    );
};

export default CategoryOptionsSelectionStep;
