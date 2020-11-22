import { useCallback, useState } from "react";

export function useOpenState<Value>(initialValue?: Value) {
    const [value, setValue] = useState<Value | undefined>(initialValue);
    const open = useCallback((value: Value) => setValue(value), [setValue]);
    const close = useCallback(() => setValue(undefined), [setValue]);
    const isOpen = !!value;

    return { isOpen, value, open, close };
}
