import React from "react";
import { FormControlLabel, Switch } from "@material-ui/core";

interface InputParameters {
    label: string;
    onChange: Function;
    value: boolean;
}

export const Toggle = ({ label, onChange, value }: InputParameters) => (
    <FormControlLabel
        control={
            <Switch
                onChange={e => onChange({ target: { value: e.target.checked } })}
                checked={value}
                color="primary"
            />
        }
        label={label}
    />
);
