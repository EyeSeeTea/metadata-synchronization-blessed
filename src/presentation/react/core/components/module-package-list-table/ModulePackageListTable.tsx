import { PaginationOptions, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import { SynchronizationReport } from "../../../../../domain/reports/entities/SynchronizationReport";
import { Store } from "../../../../../domain/stores/entities/Store";
import i18n from "../../../../../locales";
import { useAppContext } from "../../contexts/AppContext";
import Dropdown from "../dropdown/Dropdown";
import {
    InstanceSelectionConfig,
    InstanceSelectionDropdown,
    InstanceSelectionOption,
} from "../instance-selection-dropdown/InstanceSelectionDropdown";
import { ModulesListTable } from "../module-list-table/ModuleListTable";
import { PackagesListTable } from "../package-list-table/PackageListTable";
import { useViewSelector, ViewSelectorConfig } from "./useViewSelector";

export interface ModulePackageListTableProps {
    onCreate?(): void;
    onViewChange?(option: ViewOption): void;
    viewValue?: ViewOption;
    presentation: PresentationOption;
    showSelector: ViewSelectorConfig;
    showInstances: InstanceSelectionConfig;
    openSyncSummary?: (syncReport: SynchronizationReport) => void;
    onInstanceChange?: (instance?: Instance | Store) => void;
    actionButtonLabel?: ReactNode;
}

export type ViewOption = "modules" | "packages";
export type PresentationOption = "app" | "widget";

export const ModulePackageListTable: React.FC<ModulePackageListTableProps> = ({
    onCreate,
    onViewChange,
    viewValue: propsViewValue,
    presentation,
    showSelector,
    showInstances,
    openSyncSummary,
    onInstanceChange,
    actionButtonLabel,
}) => {
    const [selectedInstance, setSelectedInstance] = useState<Instance | undefined>();
    const [selectedStore, setSelectedStore] = useState<Store | undefined>();
    const [selection, setSelection] = useState<string[]>([]);
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

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
            setSelection([]);
            setSelectedStore(type === "store" ? (source as Store) : undefined);

            if (type === "remote" && source) {
                compositionRoot.instances.getById(source.id).then(result =>
                    result.match({
                        success: instance => setSelectedInstance(instance),
                        error: () => {
                            setSelectedInstance(type === "remote" ? (source as Instance) : undefined);
                            snackbar.error(i18n.t("Instance not found"));
                        },
                    })
                );
            } else {
                setSelectedInstance(undefined);
            }

            if (onInstanceChange) {
                onInstanceChange(source);
            }
        },
        [onInstanceChange, compositionRoot.instances, snackbar]
    );

    const filters = useMemo(
        () => (
            <React.Fragment key="common-filters">
                <InstanceSelectionDropdown
                    title={showInstances.store ? i18n.t("Instances & Play Stores") : i18n.t("Instances")}
                    showInstances={showInstances}
                    selectedInstance={selectedStore ? selectedStore.id : selectedInstance?.id ?? "LOCAL"}
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
        [showInstances, selectedInstance, setValue, viewSelector, updateSelectedInstance, selectedStore]
    );

    const Table = viewSelector.value === "packages" ? PackagesListTable : ModulesListTable;

    return (
        <Table
            externalComponents={filters}
            presentation={presentation}
            remoteStore={selectedStore}
            remoteInstance={selectedInstance}
            paginationOptions={paginationOptions}
            openSyncSummary={openSyncSummary}
            actionButtonLabel={actionButtonLabel}
            onActionButtonClick={
                (viewSelector.value === "modules" && !selectedInstance) || viewSelector.value === "packages"
                    ? onCreate
                    : undefined
            }
            onSelectionChange={setSelection}
            selectedIds={selection}
        />
    );
};

const paginationOptions: PaginationOptions = {
    pageSizeOptions: [10],
    pageSizeInitialValue: 10,
};
