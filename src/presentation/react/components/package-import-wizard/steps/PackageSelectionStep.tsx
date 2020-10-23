import { PaginationOptions } from "d2-ui-components";
import React from "react";
import { isInstance, isStore } from "../../../../../domain/package-import/entities/PackageSource";
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
            remoteStore={isStore(packageImportRule.source) ? packageImportRule.source : undefined}
            remoteInstance={
                isInstance(packageImportRule.source) ? packageImportRule.source : undefined
            }
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
