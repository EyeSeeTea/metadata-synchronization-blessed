import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { MultiSelector } from "d2-ui-components";

import Instance from "../../../models/instance";
import SyncParamsSelector from "../../sync-params-selector/SyncParamsSelector";

export const getInstances = async d2 => {
    const { objects } = await Instance.list(d2, {}, { paging: false });
    return objects.map(instance => ({
        value: instance.id,
        text: `${instance.name} (${instance.url} with user ${instance.username})`,
    }));
};

const InstanceSelectionStep = props => {
    const { d2, syncRule, onChange } = props;
    const [instanceOptions, setInstanceOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState(syncRule.targetInstances);

    const changeInstances = instances => {
        setSelectedOptions(instances);
        onChange(syncRule.updateTargetInstances(instances));
    };

    const changeSyncParams = syncParams => {
        onChange(syncRule.updateSyncParams(syncParams));
    };

    useEffect(() => {
        getInstances(d2).then(setInstanceOptions);
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
            <SyncParamsSelector defaultParams={syncRule.syncParams} onChange={changeSyncParams} />
        </React.Fragment>
    );
};

InstanceSelectionStep.propTypes = {
    syncRule: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

InstanceSelectionStep.defaultProps = {};

export default InstanceSelectionStep;
