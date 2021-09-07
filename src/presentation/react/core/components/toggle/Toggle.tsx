import { FormControlLabel, Switch } from "@material-ui/core";
import _ from "lodash";

interface InputParameters {
    disabled?: boolean;
    label: string;
    onChange?: Function;
    onValueChange?: Function;
    value: boolean;
}

export const Toggle = ({ label, onChange = _.noop, onValueChange = _.noop, value, disabled }: InputParameters) => (
    <FormControlLabel
        control={
            <Switch
                disabled={disabled}
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
