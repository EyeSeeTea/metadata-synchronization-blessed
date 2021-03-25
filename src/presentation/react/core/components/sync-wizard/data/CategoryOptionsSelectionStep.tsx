import { MultiSelector } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { NamedRef } from "../../../../../../domain/common/entities/Ref";
import i18n from "../../../../../../locales";
import { useAppContext } from "../../../contexts/AppContext";
import { Toggle } from "../../toggle/Toggle";
import { SyncWizardStepProps } from "../Steps";

const CategoryOptionsSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const { d2, api } = useAppContext();

    const [data, setData] = useState<NamedRef[]>();

    const options = useMemo(
        () =>
            _.uniqBy(
                _.map(data ?? [], ({ name }) => ({ value: name, text: name })),
                "value"
            ),
        [data]
    );

    const selected = useMemo(
        () =>
            _(syncRule.dataSyncAttributeCategoryOptions)
                .map(id => _.find(data, { id })?.name)
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
            .map(name => _.filter(data, { name }))
            .flatten()
            .map(({ id }) => id)
            .value();

        onChange(syncRule.updateDataSyncAttributeCategoryOptions(attributeCategoryOptions));
    };

    useEffect(() => {
        api.models.categoryOptionCombos
            .get({
                paging: false,
                fields: { id: true, name: true },
                filter: {
                    "categoryCombo.dataDimensionType": { eq: "ATTRIBUTE" },
                },
            })
            .getData()
            .then(({ objects }) => setData(objects));
    }, [api]);

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
