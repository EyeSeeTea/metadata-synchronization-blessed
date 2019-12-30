import i18n from "@dhis2/d2-i18n";
import { useD2, useD2Api, useD2ApiData } from "d2-api";
import { MultiSelector } from "d2-ui-components";
import _ from "lodash";
import React, { useMemo } from "react";
import { Toggle } from "../../toggle/Toggle";
import { SyncWizardStepProps } from "../Steps";

const CategoryOptionsSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const d2 = useD2();
    const api = useD2Api();

    const changeAttributeCategoryOptions = (attributeCategoryOptions: string[]) => {
        onChange(syncRule.updateDataSyncAttributeCategoryOptions(attributeCategoryOptions));
    };

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
            _.map(data?.objects ?? [], ({ id, name }) => ({
                value: id,
                text: `${name} (${id})`,
            })),
        [data]
    );

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
                    selected={syncRule.dataSyncAttributeCategoryOptions}
                />
            )}
        </React.Fragment>
    );
};

export default CategoryOptionsSelectionStep;
