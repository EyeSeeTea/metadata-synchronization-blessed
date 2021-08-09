import { makeStyles } from "@material-ui/core";
import { D2SchemaProperties } from "@eyeseetea/d2-api/schemas";
import { MultiSelector, useSnackbar, withSnackbar } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { MetadataEntity, MetadataPackage } from "../../../../../../domain/metadata/entities/MetadataEntities";
import { includeExcludeRulesFriendlyNames } from "../../../../../../domain/metadata/entities/MetadataFriendlyNames";
import i18n from "../../../../../../locales";
import { D2Model } from "../../../../../../models/dhis/default";
import { modelFactory } from "../../../../../../models/dhis/factory";
import { useAppContext } from "../../../contexts/AppContext";
import Dropdown, { DropdownOption } from "../../dropdown/Dropdown";
import { Toggle } from "../../toggle/Toggle";
import { SyncWizardStepProps } from "../Steps";

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
    const { d2, api } = useAppContext();
    const snackbar = useSnackbar();

    const [modelSelectItems, setModelSelectItems] = useState<DropdownOption[]>([]);
    const [models, setModels] = useState<typeof D2Model[]>([]);
    const [selectedType, setSelectedType] = useState<string>("");
    const { compositionRoot } = useAppContext();

    useEffect(() => {
        compositionRoot.instances.getById(syncRule.originInstance).then(result => {
            result.match({
                error: () => snackbar.error(i18n.t("Invalid origin instance")),
                success: instance => {
                    compositionRoot.metadata
                        .getByIds(syncRule.metadataIds, instance, "id,name,type") //type is required to transform visualizations to charts and report tables
                        .then((metadata: MetadataPackage<MetadataEntity>) => {
                            const models = _.keys(metadata).map((type: string) => modelFactory(type));

                            const options = models
                                .map((model: typeof D2Model) => {
                                    const apiModel = api.models[model.getCollectionName()];
                                    return apiModel.schema;
                                })
                                .map((schema: D2SchemaProperties) => ({
                                    name: schema.displayName,
                                    id: schema.name,
                                }));

                            setModels(models);
                            setModelSelectItems(options);
                        });
                },
            });
        });
    }, [compositionRoot, api, syncRule, snackbar]);

    const { includeRules = [], excludeRules = [] } = syncRule.metadataIncludeExcludeRules[selectedType] || {};
    const allRules = [...includeRules, ...excludeRules];
    const ruleOptions = allRules.map(rule => ({
        value: rule,
        text: includeExcludeRulesFriendlyNames[rule] || rule,
    }));

    const changeUseDefaultIncludeExclude = (useDefault: boolean) => {
        onChange(
            useDefault ? syncRule.markToUseDefaultIncludeExclude() : syncRule.markToNotUseDefaultIncludeExclude(models)
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
                label={i18n.t("Use default dependencies")}
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
