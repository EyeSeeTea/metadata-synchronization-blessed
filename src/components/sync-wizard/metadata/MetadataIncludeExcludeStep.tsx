import React, { useState, useEffect } from "react";
import { withSnackbar } from "d2-ui-components";
import SyncRule from "../../../models/syncRule";
import i18n from "../../../locales";
import { getMetadata } from "../../../utils/synchronization";
import { getBaseUrl } from "../../../utils/d2";
import { D2, ModelDefinition } from "../../../types/d2";
import _ from "lodash";
import Dropdown from "../../dropdown/Dropdown";
import { d2ModelFactory } from "../../../models/d2ModelFactory";
import { D2Model } from "../../../models/d2Model";
import { MultiSelector } from "d2-ui-components";
import { Toggle } from "../../toggle/Toggle";
import { makeStyles } from "@material-ui/core";
import { useD2 } from "d2-api/react/context";

interface MetadataIncludeExcludeStepProps {
    syncRule: SyncRule;
    onChange: (syncRule: SyncRule) => void;
}

interface ModelSelectItem {
    name: string;
    id: string;
}

const useStyles = makeStyles({
    includeExcludeContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        marginTop: "20px",
    },
    multiselectorContainer: {
        width: "100%",
    },
});

const includeExcludeRulesFriendlyNames: {
    [metadataType: string]: string;
} = {
    attributes: "Attributes",
    dataSets: "Data sets",
    categoryCombos: "Category combinations",
    "categoryCombos.attributes": "Attributes of category combinations",
    "categoryCombos.categoryOptionCombos": "Category option combinations of Category combinations",
    "categoryCombos.categoryOptionCombos.categoryOptions":
        "Category options of Category option combinations in Category combinations",
    "categoryCombos.categories": "Categories of category combinations",
    dataElements: "Data elements",
    "dataElements.attributes": "Attributes of data elements",
    "dataElements.dataElementGroups": "Data element groups of dataElements",
    dataElementGroups: "Data element groups",
    "dataElementGroups.attributes": "Attributes of Data element groups",
    "dataElementGroups.dataElements": "Data elements of data element groups",
    "dataElementGroups.dataElements.attributes":
        "Attributes of data elements in data element groups",
    "dataElementGroups.dataElements.dataElementGroups":
        "Data element groups of data elements in data element groups",
    "dataElementGroups.dataElementGroupSets": "Data element group sets of data element groups",
    "dataElementGroups.dataElementGroupSets.attributes":
        "Attributes of data element group sets in data element groups",
    dataElementGroupSets: "Data element group sets",
    "dataElementGroupSets.attributes": "Attributes of data element group sets",
    indicators: "Indicators",
    "indicators.attributes": "Attributes of indicators",
    "indicators.indicatorGroups": "Indicator groups of indicators",
    indicatorGroups: "Indicator groups",
    "indicatorGroups.attributes": "Attributes of indicator groups",
    "indicatorGroups.indicators": "Indicators of indicator groups",
    "indicatorGroups.indicators.attributes": "Attributes of indicators in indicator groups",
    "indicatorGroups.indicators.indicatorGroups":
        "Indicator groups of indicators in indicator groups",
    "indicatorGroups.indicatorGroupSet": "Indicator group sets of indicator groups",
    "indicatorGroups.indicatorGroupSets": "Indicator group sets of indicator groups",
    indicatorGroupSets: "Indicator group sets",
    "indicatorGroupSets.attributes": "Attributes of indicator group sets",
    indicatorType: "Indicator type",
    legendSets: "Legend sets",
    programs: "Programs",
    optionSets: "Option sets",
    "optionSets.options": "Options in option sets",
    organisationUnits: "Organisation units",
    "organisationUnits.attributes": "Attributes of organisation units",
    "organisationUnits.organisationUnitGroups": "Organisation unit groups of organisation units",
    organisationUnitGroups: "Organisation unit groups",
    "organisationUnitGroups.attributes": "Attributes of organisation unit groups",
    "organisationUnitGroups.organisationUnits": "Organisation units in organisation unit groups",
    "organisationUnitGroups.organisationUnits.attributes":
        "Attributes of organisation units in organisation unit groups",
    "organisationUnitGroups.organisationUnits.organisationUnitGroups":
        "Organisation unit groups of organisation units in organisation unit groups",
    "organisationUnitGroups.organisationUnitGroupSets":
        "Organisation unit group sets of organisation unit groups",
    "organisationUnitGroups.organisationUnitGroupSets.attributes":
        "Attributes of organisation unit group sets in organisation unit groups",
    organisationUnitGroupSets: "Organisation unit group sets",
    "organisationUnitGroupSets.attributes": "Attributes of organisation unit group sets",
    users: "Users",
    validationRules: "Validation rules",
    "validationRules.attributes": "Attributes of validation rules",
    "validationRules.validationRuleGroups": "Validation rule groups of validation rules",
    validationRuleGroups: "Validation rule groups",
    "validationRuleGroups.attributes": "Attributes of validation rule groups",
};

const MetadataIncludeExcludeStep: React.FC<MetadataIncludeExcludeStepProps> = ({
    syncRule,
    onChange,
}) => {
    const classes = useStyles();
    const d2 = useD2() as D2;

    const [modelSelectItems, setModelSelectItems] = useState<ModelSelectItem[]>([]);
    const [models, setModels] = useState<typeof D2Model[]>([]);
    const [selectedType, setSelectedType] = useState<string>("");

    useEffect(() => {
        getMetadata(getBaseUrl(d2), syncRule.metadataIds, "id,name").then((metadata: any) => {
            const models = _.keys(metadata).map((type: string) => {
                return d2ModelFactory(d2, type);
            });

            const parseModels = (models: typeof D2Model[]) =>
                models
                    .map((model: typeof D2Model) => model.getD2Model(d2))
                    .map((model: ModelDefinition) => ({
                        name: model.displayName,
                        id: model.name,
                    }));

            setModels(models);
            setModelSelectItems(parseModels(models));
        });
    }, [d2, syncRule]);

    const { includeRules = [], excludeRules = [] } =
        syncRule.metadataIncludeExcludeRules[selectedType] || {};
    const allRules = [...includeRules, ...excludeRules];
    const ruleOptions = allRules.map(rule => ({
        value: rule,
        text: includeExcludeRulesFriendlyNames[rule] || rule,
    }));

    const changeUseDefaultIncludeExclude = (useDefault: boolean) => {
        onChange(
            useDefault
                ? syncRule.markToUseDefaultIncludeExclude()
                : syncRule.markToNotUseDefaultIncludeExclude(models)
        );
    };

    const changeModelName = (modelName: string) => {
        setSelectedType(modelName);
    };

    const changeInclude = (currentIncludeRules: any) => {
        const type: string = selectedType;

        const oldIncludeRules: string[] = includeRules;

        const ruleToExclude = _.difference(oldIncludeRules, currentIncludeRules);
        const ruleToInclude = _.difference(currentIncludeRules, oldIncludeRules);

        if (ruleToInclude.length > 0) {
            onChange(syncRule.moveRuleFromExcludeToInclude(type, ruleToInclude));
        } else if (ruleToExclude.length > 0) {
            onChange(syncRule.moveRuleFromIncludeToExclude(type, ruleToExclude));
        }
    };

    return (
        <React.Fragment>
            <Toggle
                label={i18n.t("Use default configuration")}
                value={syncRule.useDefaultIncludeExclude}
                onValueChange={changeUseDefaultIncludeExclude}
            />
            {!syncRule.useDefaultIncludeExclude && (
                <div className={classes.includeExcludeContainer}>
                    <Dropdown
                        key={"model-selection"}
                        items={modelSelectItems}
                        onValueChange={changeModelName}
                        value={selectedType}
                        label={i18n.t("Metadata type")}
                    />

                    {selectedType && (
                        <div className={classes.multiselectorContainer}>
                            <MultiSelector
                                d2={d2}
                                height={300}
                                onChange={changeInclude}
                                options={ruleOptions}
                                selected={includeRules}
                            />
                        </div>
                    )}
                </div>
            )}
        </React.Fragment>
    );
};

export default withSnackbar(MetadataIncludeExcludeStep);
