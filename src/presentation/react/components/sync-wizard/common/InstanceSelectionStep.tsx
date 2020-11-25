import { makeStyles, Typography } from "@material-ui/core";
import { MultiSelector } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import i18n from "../../../../../locales";
import { useAppContext } from "../../../contexts/AppContext";
import SyncParamsSelector from "../../sync-params-selector/SyncParamsSelector";
import { SyncWizardStepProps } from "../Steps";

export const buildInstanceOptions = (instances: Instance[]) => {
    return instances.map(instance => ({
        value: instance.id,
        text: instance.username
            ? i18n.t("{{name}} ({{url}}) with user {{username}}")
            : i18n.t("{{name}} ({{url}}) with logged user"),
    }));
};

const InstanceSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const { d2, compositionRoot } = useAppContext();
    const classes = useStyles();

    const [selectedOptions, setSelectedOptions] = useState<string[]>(syncRule.targetInstances);
    const [targetInstances, setTargetInstances] = useState<Instance[]>([]);
    const instanceOptions = buildInstanceOptions(targetInstances);

    const includeCurrentUrlAndTypeIsEvents = (selectedinstanceIds: string[]) => {
        return (
            syncRule.type === "events" &&
            selectedinstanceIds
                .map(id => targetInstances.find(instance => instance.id === id)?.url)
                .includes(compositionRoot.instances.getApi().baseUrl)
        );
    };

    const changeInstances = (instances: string[]) => {
        setSelectedOptions(instances);

        if (includeCurrentUrlAndTypeIsEvents(instances)) {
            onChange(
                syncRule.updateTargetInstances(instances).updateDataParams({
                    ...syncRule.dataParams,
                    generateNewUid: true,
                })
            );
        } else {
            onChange(syncRule.updateTargetInstances(instances));
        }
    };

    useEffect(() => {
        compositionRoot.instances.list().then(setTargetInstances);
    }, [compositionRoot]);

    return (
        <React.Fragment>
            {syncRule.originInstance === "LOCAL" ? (
                <MultiSelector
                    d2={d2}
                    height={300}
                    onChange={changeInstances}
                    options={instanceOptions}
                    selected={selectedOptions}
                />
            ) : (
                <Typography
                    className={classes.advancedOptionsTitle}
                    variant="subtitle1"
                    gutterBottom
                >
                    {i18n.t("Destination")}: {i18n.t("This instance")}
                </Typography>
            )}

            <SyncParamsSelector
                syncRule={syncRule}
                onChange={onChange}
                generateNewUidDisabled={includeCurrentUrlAndTypeIsEvents(selectedOptions)}
            />
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    advancedOptionsTitle: {
        fontWeight: 500,
    },
});

export default InstanceSelectionStep;
