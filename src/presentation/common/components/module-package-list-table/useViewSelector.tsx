import _ from "lodash";
import { useMemo, useState } from "react";
import i18n from "../../../../locales";

export interface ViewSelectorOptions {
    modules?: boolean;
    packages?: boolean;
}

export function useViewSelector({ modules = true, packages = true }: ViewSelectorOptions) {
    const items = useMemo(
        () =>
            _.compact([
                modules && { id: "modules" as const, name: i18n.t("Modules") },
                packages && { id: "packages" as const, name: i18n.t("Packages") },
            ]),
        [modules, packages]
    );

    const [value, setValue] = useState<string | undefined>(() =>
        _.first(items.map(item => item.id))
    );

    return useMemo(() => ({ items, value, setValue }), [items, value, setValue]);
}
