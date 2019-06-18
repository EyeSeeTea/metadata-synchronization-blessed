import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import memoize from "nano-memoize";
import { MultiSelector } from "d2-ui-components";
import Instance from "../../../models/instance";

const getInstances = memoize(async d2 => {
    const instances = await Instance.list(
        d2,
        { search: "" },
        { page: 1, pageSize: 100, sorting: [] }
    );
    return instances.objects.map(instance => ({
        value: instance.id,
        text: `${instance.name} (${instance.url} with user ${instance.username})`,
    }));
});

const InstanceSelectionStep = props => {
    const { d2, syncRule } = props;
    const [instanceOptions, setInstanceOptions] = useState();
    const [selectedOptions, setSelectedOptions] = useState(syncRule.targetInstances);

    const changeInstances = instances => {
        setSelectedOptions(instances);
        syncRule.targetInstances = instances;
    };

    useEffect(() => {
        (async () => setInstanceOptions(await getInstances(d2)))();
    }, [d2]);

    return (
        <MultiSelector
            d2={d2}
            height={300}
            onChange={changeInstances}
            options={instanceOptions}
            selected={selectedOptions}
        />
    );
};

InstanceSelectionStep.propTypes = {
    syncRule: PropTypes.object.isRequired,
};

InstanceSelectionStep.defaultProps = {};

export default InstanceSelectionStep;
