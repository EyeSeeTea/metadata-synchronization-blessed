import { ConfirmationDialog, ConfirmationDialogProps } from "@eyeseetea/d2-ui-components";
import { TextField } from "@material-ui/core";
import React, { useCallback, useState } from "react";

export const InputDialog: React.FC<InputDialogProps> = props => {
    const { inputLabel, onSave, initialValue = "" } = props;

    const [value, setValue] = useState<string>(initialValue);

    const save = useCallback(() => {
        onSave(value);
    }, [value, onSave]);

    return (
        <ConfirmationDialog {...props} onSave={save}>
            <TextField
                fullWidth={true}
                label={inputLabel}
                value={value}
                onChange={event => setValue(event.target.value)}
            />
        </ConfirmationDialog>
    );
};

export interface InputDialogProps extends Omit<ConfirmationDialogProps, "onSave"> {
    inputLabel: string;
    onSave: (value: string) => void;
    initialValue?: string;
}
