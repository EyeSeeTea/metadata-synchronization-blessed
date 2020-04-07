import { makeStyles } from "@material-ui/core";
import { useD2, useD2Api } from "d2-api/react/context";
import { MultiSelector, withSnackbar } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import i18n from "../../../locales";
import { D2Model } from "../../../models/dhis/default";
import { d2ModelFactory } from "../../../models/dhis/factory";
import { D2, ModelDefinition } from "../../../types/d2";
import { MetadataPackage } from "../../../types/synchronization";
import { getMetadata } from "../../../utils/synchronization";
import Dropdown, { DropdownOption } from "../../dropdown/Dropdown";
import { Toggle } from "../../toggle/Toggle";
import { SyncWizardStepProps } from "../Steps";
import includeExcludeRulesFriendlyNames from "./RulesFriendlyNames";

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

const MetadataIncludeExcludeStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const classes = useStyles();
    const d2 = useD2();
    const api = useD2Api();

    const [modelSelectItems, setModelSelectItems] = useState<DropdownOption[]>([]);
    const [models, setModels] = useState<typeof D2Model[]>([]);
    const [selectedType, setSelectedType] = useState<string>("");

    useEffect(() => {
        getMetadata(api, syncRule.metadataIds, "id,name").then((metadata: MetadataPackage) => {
            const models = _.keys(metadata).map((type: string) => {
                return d2ModelFactory(api, type);
            });

            const options = models
                .map((model: typeof D2Model) => model.getD2Model(d2 as D2))
                .map((model: ModelDefinition) => ({
                    name: model.displayName,
                    id: model.name,
                }));

            setModels(models);
            setModelSelectItems(options);
        });
    }, [d2, api, syncRule]);

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
