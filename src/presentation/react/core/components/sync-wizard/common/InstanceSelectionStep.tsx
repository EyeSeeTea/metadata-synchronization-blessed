import { MultiSelector } from "@eyeseetea/d2-ui-components";
import { makeStyles, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Instance } from "../../../../../../domain/instance/entities/Instance";
import { User } from "../../../../../../domain/user/entities/User";
import i18n from "../../../../../../locales";
import { useAppContext } from "../../../contexts/AppContext";
import SyncParamsSelector from "../../sync-params-selector/SyncParamsSelector";
import { SyncWizardStepProps } from "../Steps";

export const buildInstanceOptions = (instances: Instance[], currentUser: User) => {
    return instances.map(instance => {
        const buildName = () => {
            if (instance.username) {
                return i18n.t("with user {{username}}", instance);
            } else if (instance.hasPermissions("read", currentUser)) {
                return i18n.t("with logged user");
            } else {
                return i18n.t("with stored user");
            }
        };

        return { value: instance.id, text: `${instance.name} (${instance.url}) ` + buildName() };
    });
};

const InstanceSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const { d2, compositionRoot } = useAppContext();
    const classes = useStyles();

    const [selectedOptions, setSelectedOptions] = useState<string[]>(syncRule.targetInstances);
    const [targetInstances, setTargetInstances] = useState<Instance[]>([]);
    const [instanceOptions, setInstanceOptions] = useState<{ value: string; text: string }[]>([]);

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
        compositionRoot.instances.list().then(instances => {
            setTargetInstances(instances);
            compositionRoot.user.current().then(user => setInstanceOptions(buildInstanceOptions(instances, user)));
        });
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
                <Typography className={classes.advancedOptionsTitle} variant="subtitle1" gutterBottom>
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
