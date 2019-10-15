import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { MultiSelector } from "d2-ui-components";
import { Typography, withStyles } from "@material-ui/core";

import Instance from "../../../models/instance";
import { Toggle } from "../../toggle/Toggle";
import i18n from "../../../locales";

export const getInstances = async d2 => {
    const { objects } = await Instance.list(d2, {}, { paging: false });
    return objects.map(instance => ({
        value: instance.id,
        text: `${instance.name} (${instance.url} with user ${instance.username})`,
    }));
};

const styles = () => ({
    advancedOptionsTitle: {
        marginTop: "40px",
    },
});

const InstanceSelectionStep = props => {
    const { d2, syncRule, onChange, classes } = props;
    const [instanceOptions, setInstanceOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState(syncRule.targetInstances);
    const [includeUserInfo, setIncludeUserInfo] = useState(syncRule.includeUserInfo);

    const changeInstances = instances => {
        setSelectedOptions(instances);
        onChange(syncRule.updateTargetInstances(instances));
    };

    const changeUserInfo = event => {
        const { value } = event.target;
        setIncludeUserInfo(value);
        onChange(syncRule.updateIncludeUserInfo(value));
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
            <Typography className={classes.advancedOptionsTitle} variant={"h7"} gutterBottom>
                {i18n.t("Advanced options")}
            </Typography>
            <Toggle
                label={i18n.t("Include user information and sharing settings")}
                onChange={changeUserInfo}
                value={includeUserInfo}
            />
        </React.Fragment>
    );
};

InstanceSelectionStep.propTypes = {
    syncRule: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

InstanceSelectionStep.defaultProps = {};

export default withStyles(styles)(InstanceSelectionStep);
