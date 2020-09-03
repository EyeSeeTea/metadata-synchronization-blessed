import React from "react";
import { TextFieldProps, TextField } from "@material-ui/core";

/* Wrap TextField with those two changes:

- props.onChange is called with the string, not the event.
- props.onChange is called on blur, not on every keystroke, this way the UI is much more responsive.
*/

type TextFieldOnBlurProps = Omit<TextFieldProps, "string" | "onChange"> & {
    value: string;
    onChange(newValue: string): void;
};

const TextFieldOnBlur: React.FC<TextFieldOnBlurProps> = props => {
    const [value, setValue] = React.useState<string>(props.value || "");
    const { onChange } = props;

    const callParentOnChange = React.useCallback(() => {
        onChange(value);
    }, [value, onChange]);

    const setValueFromEvent = React.useCallback(
        (ev: React.ChangeEvent<{ value: string }>) => {
            setValue(ev.target.value);
        },
        [setValue]
    );

    return (
        <TextField
            {...props}
            value={value}
            onBlur={callParentOnChange}
            onChange={setValueFromEvent}
        />
    );
};

export default React.memo(TextFieldOnBlur);
