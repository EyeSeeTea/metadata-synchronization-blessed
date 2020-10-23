import { PaginationOptions } from "d2-ui-components";
import React, { useCallback, useMemo, useState } from "react";
import { Instance } from "../../../../domain/instance/entities/Instance";
import i18n from "../../../../locales";
import SyncReport from "../../../../models/syncReport";
import { ModulesListTable } from "../module-list-table/ModuleListTable";
import { PackagesListTable } from "../package-list-table/PackageListTable";
import Dropdown from "../dropdown/Dropdown";
import {
    InstanceSelectionConfig,
    InstanceSelectionDropdown,
    InstanceSelectionOption,
} from "../instance-selection-dropdown/InstanceSelectionDropdown";
import { useViewSelector, ViewSelectorConfig } from "./useViewSelector";

export interface ModulePackageListTableProps {
    onCreate?(): void;
    onViewChange?(option: ViewOption): void;
    viewValue?: ViewOption;
    presentation: PresentationOption;
    showSelector: ViewSelectorConfig;
    showInstances: InstanceSelectionConfig;
    openSyncSummary?: (syncReport: SyncReport) => void;
    onInstanceChange?: (instance?: Instance) => void;
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
        openSyncSummary,
        onInstanceChange,
    }) => {
        const [selectedInstance, setSelectedInstance] = useState<Instance>();
        const [showStore, setShowStore] = useState<boolean>(false);

        const viewSelector = useViewSelector(showSelector, propsViewValue);

        const setValue = useCallback(
            (value: ViewOption) => {
                viewSelector.setValue(value);
                if (onViewChange) onViewChange(value);
            },
            [viewSelector, onViewChange]
        );

        const updateSelectedInstance = useCallback(
            (type: InstanceSelectionOption, instance?: Instance) => {
                setShowStore(type === "store");
                setSelectedInstance(instance);

                if (onInstanceChange) {
                    onInstanceChange(instance);
                }
            },
            [onInstanceChange]
        );

        const filters = useMemo(
            () => (
                <React.Fragment key="common-filters">
                    <InstanceSelectionDropdown
                        showInstances={showInstances}
                        selectedInstance={showStore ? "STORE" : selectedInstance?.id ?? "LOCAL"}
                        onChangeSelected={updateSelectedInstance}
                    />

                    {viewSelector.items.length > 1 && viewSelector.value && (
                        <Dropdown
                            items={viewSelector.items}
                            value={viewSelector.value}
                            onValueChange={setValue}
                            label={i18n.t("View")}
                            hideEmpty={true}
                        />
                    )}
                </React.Fragment>
            ),
            [
                showInstances,
                selectedInstance,
                setValue,
                viewSelector,
                updateSelectedInstance,
                showStore,
            ]
        );

        const Table = viewSelector.value === "packages" ? PackagesListTable : ModulesListTable;

        return (
            <Table
                externalComponents={filters}
                presentation={presentation}
                showStore={showStore}
                remoteInstance={selectedInstance}
                paginationOptions={paginationOptions}
                openSyncSummary={openSyncSummary}
                onActionButtonClick={
                    (viewSelector.value === "modules" && !selectedInstance) ||
                    (viewSelector.value === "packages" && (selectedInstance || showStore))
                        ? onCreate
                        : undefined
                }
            />
        );
    }
);

const paginationOptions: PaginationOptions = {
    pageSizeOptions: [10],
    pageSizeInitialValue: 10,
};
