import { FormControlLabel, Switch } from "@material-ui/core";
import _ from "lodash";
import React from "react";

interface InputParameters {
    label: string;
    onChange?: Function;
    onValueChange?: Function;
    value: boolean;
}

export const Toggle = ({
    label,
    onChange = _.noop,
    onValueChange = _.noop,
    value,
}: InputParameters) => (
    <FormControlLabel
        control={
            <Switch
                onChange={e => {
                    onChange({ target: { value: e.target.checked } });
                    onValueChange(e.target.checked);
                }}
                checked={value}
                color="primary"
            />
        }
        label={label}
    />
);
