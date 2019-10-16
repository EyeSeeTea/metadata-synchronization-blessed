import React, { useState } from "react";
import { Typography, withStyles } from "@material-ui/core";
import i18n from "@dhis2/d2-i18n";

import { SynchronizationParams } from "../../types/synchronization";
import { Toggle } from "../toggle/Toggle";

interface Props {
    defaultParams: SynchronizationParams;
    onChange(newParams: SynchronizationParams): void;
    classes: any;
}

interface PseudoEvent {
    target: {
        value: boolean;
    };
}

const styles = () => ({
    advancedOptionsTitle: {
        marginTop: "40px",
        fontWeight: 500,
    },
});

const SyncParamsSelector = (props: Props) => {
    const { defaultParams, onChange, classes } = props;
    const [syncParams, updateSyncParams] = useState<SynchronizationParams>(defaultParams);

    const changeSharingSettings = (event: PseudoEvent) => {
        const { value } = event.target;
        const newParams: SynchronizationParams = {
            ...syncParams,
            includeSharingSettings: value,
        };

        updateSyncParams(newParams);
        onChange(newParams);
    };

    const changeAtomic = (event: PseudoEvent) => {
        const { value } = event.target;
        const newParams: SynchronizationParams = {
            ...syncParams,
            atomicMode: value ? "NONE" : "ALL",
        };

        updateSyncParams(newParams);
        onChange(newParams);
    };

    const changeReplace = (event: PseudoEvent) => {
        const { value } = event.target;
        const newParams: SynchronizationParams = {
            ...syncParams,
            mergeMode: value ? "REPLACE" : "MERGE",
        };

        updateSyncParams(newParams);
        onChange(newParams);
    };

    return (
        <React.Fragment>
            <Typography className={classes.advancedOptionsTitle} variant={"subtitle1"} gutterBottom>
                {i18n.t("Advanced options")}
            </Typography>
            <div>
                <Toggle
                    label={i18n.t("Include user information and sharing settings")}
                    onChange={changeSharingSettings}
                    value={!!syncParams.includeSharingSettings}
                />
            </div>

            <div>
                <Toggle
                    label={i18n.t("Disable atomic verification")}
                    onChange={changeAtomic}
                    value={syncParams.atomicMode === "NONE"}
                />
            </div>
            <div>
                <Toggle
                    label={i18n.t("Replace objects in destination instance")}
                    onChange={changeReplace}
                    value={syncParams.mergeMode === "REPLACE"}
                />
            </div>
        </React.Fragment>
    );
};

export default withStyles(styles)(SyncParamsSelector);
