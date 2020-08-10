import { PaginationOptions } from "d2-ui-components";
import React, { useCallback, useMemo, useState } from "react";
import { Instance } from "../../../../domain/instance/entities/Instance";
import i18n from "../../../../locales";
import { ModulesListTable } from "../../../common/components/module-list-table/ModuleListTable";
import { PackagesListTable } from "../../../common/components/package-list-table/PackageListTable";
import Dropdown from "../../../webapp/components/dropdown/Dropdown";
import { InstanceSelectionConfig, InstanceSelectionDropdown } from "../instance-selection-dropdown/InstanceSelectionDropdown";
import { useViewSelector, ViewSelectorConfig } from "./useViewSelector";

export interface ModulePackageListTableProps {
    onCreate?(): void;
    onViewChange?(option: ViewOption): void;
    viewValue?: ViewOption;
    presentation: PresentationOption;
    showSelector: ViewSelectorConfig;
    showInstances: InstanceSelectionConfig;
}

export type ViewOption = "modules" | "packages";
export type PresentationOption = "app" | "widget";

export const ModulePackageListTable: React.FC<ModulePackageListTableProps> = React.memo(
    ({
        onCreate,
        onViewChange,
        viewValue: propsViewValue,
        presentation,
        showSelector,
        showInstances,
    }) => {
        const [selectedInstance, setSelectedInstance] = useState<Instance>();

        const viewSelector = useViewSelector(showSelector);
        const viewValue = propsViewValue ?? viewSelector.value;

        const setValue = useCallback(
            (value: ViewOption) => {
                viewSelector.setValue(value);
                if (onViewChange) onViewChange(value);
            },
            [viewSelector, onViewChange]
        );

        const filters = useMemo(
            () => (
                <React.Fragment>
                    <InstanceSelectionDropdown
                        showInstances={showInstances}
                        selectedInstance={selectedInstance?.id ?? "LOCAL"}
                        onChangeSelected={setSelectedInstance}
                    />

                    {viewSelector.items.length > 1 && viewValue && (
                        <Dropdown
                            items={viewSelector.items}
                            value={viewValue}
                            onValueChange={setValue}
                            label={i18n.t("View")}
                            hideEmpty={true}
                        />
                    )}
                </React.Fragment>
            ),
            [showInstances, selectedInstance, setValue, viewSelector, viewValue]
        );

        const Table = viewSelector.value === "packages" ? PackagesListTable : ModulesListTable;

        return (
            <Table
                externalComponents={filters}
                presentation={presentation}
                remoteInstance={selectedInstance}
                paginationOptions={paginationOptions}
                onActionButtonClick={
                    viewSelector.value === "modules" && !selectedInstance ? onCreate : undefined
                }
            />
        );
    }
);

const paginationOptions: PaginationOptions = {
    pageSizeOptions: [10],
    pageSizeInitialValue: 10,
};
