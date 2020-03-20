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
    const [generateNewUidDisabled, setGenerateNewUidDisabled] = useState<boolean>(false);
    const [targetInstances, setTargetInstances] = useState<Instance[]>([]);

    const refreshGenerateNewUidParam = () => {
        if (syncRule.type === "events") {
            const selectedInstanceUrls = selectedOptions.map(
                id => targetInstances.find(instance => instance.id === id)?.url
            );

            const includeSelectedCurrentUrl = selectedInstanceUrls.includes(api.baseUrl);

            if (includeSelectedCurrentUrl) {
                onChange(
                    syncRule.updateDataParams({
                        ...syncRule.dataParams,
                        generateNewUid: true,
                    })
                );
            }

            setGenerateNewUidDisabled(includeSelectedCurrentUrl);
        }
    };

    const changeInstances = (instances: string[]) => {
        setSelectedOptions(instances);
        onChange(syncRule.updateTargetInstances(instances));
    };

    useEffect(() => {
        getInstanceOptions(api).then(setInstanceOptions);
        getInstances(api).then(setTargetInstances);
    }, [api]);

    useEffect(() => {
        refreshGenerateNewUidParam();
    }, [selectedOptions, targetInstances]);

    console.log(generateNewUidDisabled);

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
                generateNewUidDisabled={generateNewUidDisabled}
            />
        </React.Fragment>
    );
};

export default InstanceSelectionStep;
