import { PaginationOptions } from "d2-ui-components";
import React from "react";
import { PackagesListTable } from "../../package-list-table/PackageListTable";
import { PackageImportWizardProps } from "../PackageImportWizard";

export const PackageSelectionStep: React.FC<PackageImportWizardProps> = ({
    packageImportRule,
    onChange,
}) => {
    const handleSelectionChange = (ids: string[]) => {
        onChange(packageImportRule.updatePackageIds(ids));
    };

    return (
        <PackagesListTable
            presentation={"app"}
            showStore={false}
            remoteInstance={packageImportRule.instance}
            paginationOptions={paginationOptions}
            onActionButtonClick={undefined}
            isImportDialog={true}
            onSelectionChange={handleSelectionChange}
            selectedIds={packageImportRule.packageIds}
        />
    );
};

const paginationOptions: PaginationOptions = {
    pageSizeOptions: [10],
    pageSizeInitialValue: 10,
};
