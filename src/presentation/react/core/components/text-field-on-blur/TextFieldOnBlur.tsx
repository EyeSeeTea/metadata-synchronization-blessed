import { TextField, TextFieldProps } from "@material-ui/core";
import React, { useCallback, useEffect, useRef, useState } from "react";

/* Wrap TextField with those two changes:

- props.onChange is called with the string, not the event.
- props.onChange is called on blur, not on every keystroke, this way the UI is much more responsive.
*/

type TextFieldOnBlurProps = Omit<TextFieldProps, "string" | "onChange"> & {
    value: string;
    onChange(newValue: string): void;
};

const TextFieldOnBlur: React.FC<TextFieldOnBlurProps> = props => {
    const { onChange } = props;
    // Use props.value as initial value for the initial state but also react to changes from the parent
    const propValue = props.value;
    const prevPropValue = useRef(propValue);
    const [value, setValue] = useState<string>(propValue);

    useEffect(() => {
        if (propValue !== prevPropValue.current) {
            console.log("upchange", { value, propValue, prev: prevPropValue.current });
            setValue(propValue);
            prevPropValue.current = propValue;
        }
    }, [propValue, prevPropValue, value]);

    const callParentOnChange = useCallback(() => {
        onChange(value);
    }, [value, onChange]);

    const setValueFromEvent = useCallback(
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
