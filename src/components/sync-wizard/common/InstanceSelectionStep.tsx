import { D2Api, useD2, useD2Api } from "d2-api";
import { MultiSelector } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import Instance from "../../../models/instance";
import SyncParamsSelector from "../../sync-params-selector/SyncParamsSelector";
import { SyncWizardStepProps } from "../Steps";

export const getInstanceOptions = async (api: D2Api) => {
    const { objects } = await Instance.list(api, {}, { paging: false });
    return objects.map(instance => ({
        value: instance.id,
        text: `${instance.name} (${instance.url} with user ${instance.username})`,
    }));
};

const getInstances = async (api: D2Api) => {
    const { objects } = await Instance.list(api, {}, { paging: false });
    return objects;
};

const InstanceSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const d2 = useD2();
    const api = useD2Api();
    const [selectedOptions, setSelectedOptions] = useState<string[]>(syncRule.targetInstances);
    const [instanceOptions, setInstanceOptions] = useState<{ value: string; text: string }[]>([]);
    const [targetInstances, setTargetInstances] = useState<Instance[]>([]);

    const includeCurrentUrlAndTypeIsEvents = (selectedinstanceIds: string[]) => {
        return (
            syncRule.type === "events" &&
            selectedinstanceIds
                .map(id => targetInstances.find(instance => instance.id === id)?.url)
                .includes(api.baseUrl)
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
        getInstanceOptions(api).then(setInstanceOptions);
        getInstances(api).then(setTargetInstances);
    }, [api]);

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
