import React from "react";
import { ModulePackageListTable } from "../../../common/components/module-package-list-table/ModulePackageListTable";

const showSelector = {
    modules: true,
    packages: true,
};

const showInstances = {
    local: true,
    remote: true,
    store: true,
};

export const ModuleListWidget: React.FC = React.memo(() => {
    return (
        <ModulePackageListTable
            showSelector={showSelector}
            showInstances={showInstances}
            presentation={"widget"}
        />
    );
});
