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
import { Store } from "../../../../domain/packages/entities/Store";

export interface ModulePackageListTableProps {
    onCreate?(): void;
    onViewChange?(option: ViewOption): void;
    viewValue?: ViewOption;
    presentation: PresentationOption;
    showSelector: ViewSelectorConfig;
    showInstances: InstanceSelectionConfig;
    openSyncSummary?: (syncReport: SyncReport) => void;
    onInstanceChange?: (instance?: Instance | Store) => void;
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
        const [selectedInstance, setSelectedInstance] = useState<Instance | undefined>();
        const [selectedStore, setSelectedStore] = useState<Store | undefined>();

        const viewSelector = useViewSelector(showSelector, propsViewValue);

        const setValue = useCallback(
            (value: ViewOption) => {
                viewSelector.setValue(value);
                if (onViewChange) onViewChange(value);
            },
            [viewSelector, onViewChange]
        );

        const updateSelectedInstance = useCallback(
            (type: InstanceSelectionOption, source?: Instance | Store) => {
                setSelectedStore(type === "store" ? (source as Store) : undefined);
                setSelectedInstance(type === "remote" ? (source as Instance) : undefined);

                if (onInstanceChange) {
                    onInstanceChange(source);
                }
            },
            [onInstanceChange]
        );

        const filters = useMemo(
            () => (
                <React.Fragment key="common-filters">
                    <InstanceSelectionDropdown
                        title={
                            showInstances.store
                                ? i18n.t("Instances & Play Stores")
                                : i18n.t("Instances")
                        }
                        showInstances={showInstances}
                        selectedInstance={
                            selectedStore ? selectedStore.id : selectedInstance?.id ?? "LOCAL"
                        }
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
                selectedStore,
            ]
        );

        const Table = viewSelector.value === "packages" ? PackagesListTable : ModulesListTable;

        debugger;
        return (
            <Table
                externalComponents={filters}
                presentation={presentation}
                remoteStore={selectedStore}
                remoteInstance={selectedInstance}
                paginationOptions={paginationOptions}
                openSyncSummary={openSyncSummary}
                onActionButtonClick={
                    (viewSelector.value === "modules" && !selectedInstance) ||
                    (viewSelector.value === "packages" && (selectedInstance || selectedStore))
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
