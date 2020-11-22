import { makeStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import ArrowRightIcon from "@material-ui/icons/ArrowRightAlt";
import React, { useCallback } from "react";
import { Ref } from "../../../../types/d2-api";
import { Maybe } from "../../../../types/utils";
import {
    InstanceSelectionDropdown,
    InstanceSelectionDropdownProps,
} from "../../../react/components/instance-selection-dropdown/InstanceSelectionDropdown";

interface InstancesSelectorsProps {
    sourceInstance: Maybe<Ref>;
    onChangeSource: InstanceSelectionDropdownProps["onChangeSelected"];
    destinationInstance: Maybe<Ref>;
    onChangeDestination(instance: Ref | undefined): void;
}

type ChangeDestination = InstanceSelectionDropdownProps["onChangeSelected"];

const InstancesSelectors: React.FC<InstancesSelectorsProps> = ({
    sourceInstance,
    onChangeSource,
    destinationInstance,
    onChangeDestination,
}) => {
    const classes = useStyles();

    const sourceInstanceIsRemote = !!sourceInstance;
    const showRemoteInstances = sourceInstanceIsRemote
        ? showOnlyLocalInstances
        : showOnlyRemoteInstances;
    const sourceSelectedInstance = sourceInstance?.id ?? "LOCAL";

    const changeDestination = useCallback<ChangeDestination>(
        (_type, instance) => {
            onChangeDestination(instance);
        },
        [onChangeDestination]
    );

    return (
        <div className={classes.instances}>
            <Typography className={classes.label}>Origin</Typography>

            <InstanceSelectionDropdown
                view="inline"
                showInstances={showAllInstances}
                selectedInstance={sourceSelectedInstance}
                onChangeSelected={onChangeSource}
            />

            <ArrowRightIcon className={classes.icon} />

            <Typography className={classes.label}>Destination</Typography>

            <InstanceSelectionDropdown
                key={sourceSelectedInstance}
                view="inline"
                showInstances={showRemoteInstances}
                selectedInstance={destinationInstance?.id}
                onChangeSelected={changeDestination}
            />
        </div>
    );
};

const showAllInstances = { local: true, remote: true };
const showOnlyRemoteInstances = { local: false, remote: true };
const showOnlyLocalInstances = { local: true, remote: false };

const useStyles = makeStyles({
    icon: {
        padding: "0px 25px",
        marginBottom: 5,
        verticalAlign: "middle",
    },
    instances: {
        float: "right",
        padding: "0px 10px",
        border: "1px solid",
    },
    label: {
        display: "inline-block",
        fontWeight: 400,
        fontSize: "1rem",
        marginTop: "4px",
        verticalAlign: "top",
    },
});

export default React.memo(InstancesSelectors);
