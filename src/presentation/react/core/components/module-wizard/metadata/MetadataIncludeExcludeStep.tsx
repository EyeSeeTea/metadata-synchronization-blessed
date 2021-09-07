import { makeStyles } from "@material-ui/core";
import { D2SchemaProperties } from "@eyeseetea/d2-api/schemas";
import { MultiSelector } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { MetadataPackage } from "../../../../../../domain/metadata/entities/MetadataEntities";
import { includeExcludeRulesFriendlyNames } from "../../../../../../domain/metadata/entities/MetadataFriendlyNames";
import { MetadataModule } from "../../../../../../domain/modules/entities/MetadataModule";
import i18n from "../../../../../../locales";
import { D2Model } from "../../../../../../models/dhis/default";
import { modelFactory } from "../../../../../../models/dhis/factory";
import { getMetadata } from "../../../../../../utils/synchronization";
import { useAppContext } from "../../../contexts/AppContext";
import Dropdown, { DropdownOption } from "../../dropdown/Dropdown";
import { Toggle } from "../../toggle/Toggle";
import { ModuleWizardStepProps } from "../Steps";

export const MetadataIncludeExcludeStep: React.FC<ModuleWizardStepProps<MetadataModule>> = ({ module, onChange }) => {
    const classes = useStyles();
    const { d2, api } = useAppContext();

    const [modelSelectItems, setModelSelectItems] = useState<DropdownOption[]>([]);
    const [models, setModels] = useState<typeof D2Model[]>([]);
    const [selectedType, setSelectedType] = useState<string>("");

    useEffect(() => {
        getMetadata(api, module.metadataIds, "id,name").then((metadata: MetadataPackage) => {
            const models = _.keys(metadata).map((type: string) => {
                return modelFactory(type);
            });

            const options = models
                .map((model: typeof D2Model) => api.models[model.getCollectionName()].schema)
                .map((schema: D2SchemaProperties) => ({
                    name: schema.displayName,
                    id: schema.name,
                }));

            setModels(models);
            setModelSelectItems(options);
        });
    }, [d2, api, module]);

    const { includeRules = [], excludeRules = [] } = module.metadataIncludeExcludeRules[selectedType] ?? {};
    const allRules = [...includeRules, ...excludeRules];
    const ruleOptions = allRules.map(rule => ({
        value: rule,
        text: includeExcludeRulesFriendlyNames[rule] ?? rule,
    }));

    const changeUseDefaultIncludeExclude = (useDefault: boolean) => {
        onChange(
            useDefault ? module.markToUseDefaultIncludeExclude() : module.markToNotUseDefaultIncludeExclude(models)
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
            onChange(module.moveRuleFromExcludeToInclude(type, ruleToInclude));
        } else if (ruleToExclude.length > 0) {
            onChange(module.moveRuleFromIncludeToExclude(type, ruleToExclude));
        }
    };

    return (
        <React.Fragment>
            <Toggle
                label={i18n.t("Use default dependencies")}
                value={module.useDefaultIncludeExclude}
                onValueChange={changeUseDefaultIncludeExclude}
            />

            {!module.useDefaultIncludeExclude && (
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
