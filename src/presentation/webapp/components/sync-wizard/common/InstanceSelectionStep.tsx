import { MultiSelector } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import { useAppContext } from "../../../../common/contexts/AppContext";
import SyncParamsSelector from "../../sync-params-selector/SyncParamsSelector";
import { SyncWizardStepProps } from "../Steps";

export const buildInstanceOptions = (instances: Instance[]) => {
    return instances.map(instance => ({
        value: instance.id,
        text: `${instance.name} (${instance.url} with user ${instance.username})`,
    }));
};

const InstanceSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const { d2, compositionRoot } = useAppContext();
    const [selectedOptions, setSelectedOptions] = useState<string[]>(syncRule.targetInstances);
    const [targetInstances, setTargetInstances] = useState<Instance[]>([]);
    const instanceOptions = buildInstanceOptions(targetInstances);

    const includeCurrentUrlAndTypeIsEvents = (selectedinstanceIds: string[]) => {
        return (
            syncRule.type === "events" &&
            selectedinstanceIds
                .map(id => targetInstances.find(instance => instance.id === id)?.url)
                .includes(compositionRoot.instances().getApi().baseUrl)
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
        compositionRoot
            .instances()
            .list()
            .then(setTargetInstances);
    }, [compositionRoot]);

    return (
        <React.Fragment>
            <MultiSelector
                d2={d2}
                height={300}
                onChange={changeInstances}
                options={instanceOptions}
                selected={selectedOptions}
            />

            <SyncParamsSelector
                syncRule={syncRule}
                onChange={onChange}
                generateNewUidDisabled={includeCurrentUrlAndTypeIsEvents(selectedOptions)}
            />
        </React.Fragment>
    );
};

export default InstanceSelectionStep;
