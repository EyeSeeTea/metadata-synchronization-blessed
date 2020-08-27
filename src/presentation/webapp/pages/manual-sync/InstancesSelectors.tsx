import React from "react";
import ArrowRightIcon from "@material-ui/icons/ArrowRightAlt";
import {
    InstanceSelectionDropdown,
    InstanceSelectionDropdownProps,
} from "../../../common/components/instance-selection-dropdown/InstanceSelectionDropdown";
import { Ref } from "../../../../types/d2-api";
import { Maybe } from "../../../../types/utils";

interface InstancesSelectorsProps {
    sourceInstance: Maybe<Ref>;
    onChangeSource: InstanceSelectionDropdownProps["onChangeSelected"];
    destinationInstance: Maybe<Ref>;
    onChangeDestination(instance: Ref | undefined): void;
}

type ChangeDestination = InstanceSelectionDropdownProps["onChangeSelected"];

const InstancesSelectors: React.FC<InstancesSelectorsProps> = props => {
    const { sourceInstance, onChangeSource, destinationInstance, onChangeDestination } = props;

    const sourceInstanceIsRemote = !!sourceInstance;
    const showRemoteInstances = sourceInstanceIsRemote
        ? showOnlyLocalInstances
        : showOnlyRemoteInstances;
    const sourceSelectedInstance = sourceInstance?.id ?? "LOCAL";

    const changeDestination = React.useCallback<ChangeDestination>(
        (_type, instance) => {
            onChangeDestination(instance);
        },
        [onChangeDestination]
    );

    return (
        <React.Fragment>
            <InstanceSelectionDropdown
                view="inline"
                showInstances={showAllInstances}
                selectedInstance={sourceSelectedInstance}
                onChangeSelected={onChangeSource}
            />

            <ArrowRightIcon />

            <InstanceSelectionDropdown
                key={sourceSelectedInstance}
                view="inline"
                showInstances={showRemoteInstances}
                selectedInstance={destinationInstance?.id}
                onChangeSelected={changeDestination}
            />
        </React.Fragment>
    );
};

const showAllInstances = { local: true, remote: true };
const showOnlyRemoteInstances = { local: false, remote: true };
const showOnlyLocalInstances = { local: true, remote: false };

export default React.memo(InstancesSelectors);
