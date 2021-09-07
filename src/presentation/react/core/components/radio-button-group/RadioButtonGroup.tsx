import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import _ from "lodash";
import React from "react";

interface RadioButtonGroupProps {
    items: {
        id: string;
        name: string;
        disabled?: boolean;
    }[];
    value: string;
    defaultValue?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onValueChange?: (value: string) => void;
    title?: string;
    horizontal?: boolean;
}

export default function RadioButtonGroup({
    items,
    value,
    defaultValue,
    onChange = _.noop,
    onValueChange = _.noop,
    title,
    horizontal = true,
}: RadioButtonGroupProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event);
        onValueChange(event.target.value as string);
    };

    return (
        <FormControl component="fieldset">
            {title && <FormLabel component="legend">{title}</FormLabel>}

            <RadioGroup defaultValue={defaultValue} value={value} onChange={handleChange} row={horizontal}>
                {items.map(({ id, name, disabled = false }, index) => (
                    <FormControlLabel
                        key={`radio-option-${index}`}
                        value={id}
                        control={<Radio color="primary" />}
                        label={name}
                        disabled={disabled}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    );
}
