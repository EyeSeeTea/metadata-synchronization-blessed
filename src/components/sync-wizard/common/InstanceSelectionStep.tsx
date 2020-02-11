import { useD2 } from "d2-api";
import { MultiSelector } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import Instance from "../../../models/instance";
import { D2 } from "../../../types/d2";
import SyncParamsSelector from "../../sync-params-selector/SyncParamsSelector";
import { SyncWizardStepProps } from "../Steps";

export const getInstanceOptions = async (d2: D2) => {
    const { objects } = await Instance.list(d2, {}, { paging: false });
    return objects.map(instance => ({
        value: instance.id,
        text: `${instance.name} (${instance.url} with user ${instance.username})`,
    }));
};

const InstanceSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const d2 = useD2();
    const [selectedOptions, setSelectedOptions] = useState<string[]>(syncRule.targetInstances);
    const [instanceOptions, setInstanceOptions] = useState<{ value: string; text: string }[]>([]);

    const changeInstances = (instances: string[]) => {
        setSelectedOptions(instances);
        onChange(syncRule.updateTargetInstances(instances));
    };

    useEffect(() => {
        getInstanceOptions(d2 as D2).then(setInstanceOptions);
    }, [d2]);

    return (
        <React.Fragment>
            <MultiSelector
                d2={d2}
                height={300}
                onChange={changeInstances}
                options={instanceOptions}
                selected={selectedOptions}
            />

            <SyncParamsSelector syncRule={syncRule} onChange={onChange} />
        </React.Fragment>
    );
};

export default InstanceSelectionStep;
