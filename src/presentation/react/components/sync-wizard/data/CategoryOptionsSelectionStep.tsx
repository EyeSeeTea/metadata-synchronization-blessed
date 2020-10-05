import { useD2ApiData } from "d2-api";
import { MultiSelector } from "d2-ui-components";
import _ from "lodash";
import React, { useMemo } from "react";
import i18n from "../../../../../locales";
import { useAppContext } from "../../../contexts/AppContext";
import { Toggle } from "../../toggle/Toggle";
import { SyncWizardStepProps } from "../Steps";

const CategoryOptionsSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const { d2, api } = useAppContext();

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

    const selected = useMemo(
        () =>
            _(syncRule.dataSyncAttributeCategoryOptions)
                .map(id => _.find(data?.objects, { id })?.name)
                .uniq()
                .compact()
                .value(),
        [data, syncRule]
    );

    const updateSyncAll = (value: boolean) => {
        onChange(
            syncRule
                .updateDataSyncAllAttributeCategoryOptions(value)
                .updateDataSyncAttributeCategoryOptions(undefined)
        );
    };

    const changeAttributeCategoryOptions = (selectedNames: string[]) => {
        const attributeCategoryOptions = _(selectedNames)
            .map(name => _.filter(data?.objects, { name }))
            .flatten()
            .map(({ id }) => id)
            .value();

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
                    selected={selected}
                />
            )}
        </React.Fragment>
    );
};

export default CategoryOptionsSelectionStep;
