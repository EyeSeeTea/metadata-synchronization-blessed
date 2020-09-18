import React from "react";

export function useOpenState<Value>(initialValue?: Value) {
    const [value, setValue] = React.useState<Value | undefined>(initialValue);
    const open = React.useCallback((value: Value) => setValue(value), [setValue]);
    const close = React.useCallback(() => setValue(undefined), [setValue]);
    const isOpen = !!value;

    return { isOpen, value, open, close };
}
