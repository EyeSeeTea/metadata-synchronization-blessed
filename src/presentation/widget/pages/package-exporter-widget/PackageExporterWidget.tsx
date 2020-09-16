import React from "react";
import { ModulePackageListTable } from "../../../react/components/module-package-list-table/ModulePackageListTable";

const showSelector = {
    modules: false,
    packages: true,
};

const showInstances = {
    local: true,
    remote: false,
    store: true,
};

export const PackageExporterWidget: React.FC = React.memo(() => {
    return (
        <ModulePackageListTable
            showSelector={showSelector}
            showInstances={showInstances}
            presentation={"widget"}
        />
    );
});
