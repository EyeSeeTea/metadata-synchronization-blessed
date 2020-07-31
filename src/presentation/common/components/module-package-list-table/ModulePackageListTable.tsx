import React, { useCallback, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { Instance } from "../../../../domain/instance/entities/Instance";
import i18n from "../../../../locales";
import { ModulesListTable } from "../../../common/components/module-list-table/ModuleListTable";
import { PackagesListTable } from "../../../common/components/package-list-table/PackageListTable";
import { useAppContext } from "../../../common/contexts/AppContext";
import Dropdown from "../../../webapp/components/dropdown/Dropdown";
import { PaginationOptions } from "d2-ui-components";

export interface ModulePackageListTableProps {
    onCreate?(): void;
    onViewChange?(option: ViewOption): void;
    viewValue?: ViewOption;
    showSelector: {
        modules: boolean;
        packages: boolean;
    };
    showInstances: {
        local: boolean;
        remote: boolean;
        store: boolean;
    };
}

export type ViewOption = "modules" | "packages";

export const ModulePackageListTable: React.FC<ModulePackageListTableProps> = React.memo(props => {
    const { onCreate, onViewChange, showSelector, showInstances } = props;
    const { compositionRoot } = useAppContext();
    const viewSelector = useViewSelector(showSelector);
    const viewValue = props.viewValue || viewSelector.value;
    const [instances, setInstances] = useState<Instance[]>([]);
    const [selectedInstance, setSelectedInstance] = useState<Instance>();

    const updateSelectedInstance = useCallback(
        (id: string) => {
            setSelectedInstance(instances.find(instance => instance.id === id));
        },
        [instances]
    );

    const instanceItems = useMemo(() => {
        return _.compact([
            showInstances.local && { id: "LOCAL", name: i18n.t("This instance") },
            showInstances.store && { id: "STORE", name: i18n.t("Store") },
            ...(showInstances.remote ? instances : []),
        ]);
    }, [showInstances, instances]);

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
                <Dropdown
                    items={instanceItems}
                    value={selectedInstance?.id ?? "LOCAL"}
                    onValueChange={updateSelectedInstance}
                    label={i18n.t("Instance")}
                    hideEmpty={true}
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
        [viewSelector, viewValue, setValue, instanceItems, selectedInstance, updateSelectedInstance]
    );

    useEffect(() => {
        compositionRoot.instances.list().then(setInstances);
    }, [compositionRoot]);

    const Table = viewSelector.value === "packages" ? PackagesListTable : ModulesListTable;

    return (
        <Table
            externalComponents={filters}
            presentation={"widget"}
            remoteInstance={selectedInstance}
            paginationOptions={paginationOptions}
            onActionButtonClick={
                viewSelector.value === "modules" && !selectedInstance ? onCreate : undefined
            }
        />
    );
});

const paginationOptions: PaginationOptions = {
    pageSizeOptions: [10],
    pageSizeInitialValue: 10,
};

function useViewSelector(options: { modules?: boolean; packages?: boolean }) {
    const { modules: showModules = true, packages: showPackages = true } = options;

    const items = useMemo(() => {
        return _.compact([
            showModules && { id: "modules" as const, name: i18n.t("Modules") },
            showPackages && { id: "packages" as const, name: i18n.t("Packages") },
        ]);
    }, [showModules, showPackages]);

    const [value, setValue] = useState<string | undefined>(() => {
        return _.first(items.map(item => item.id));
    });

    return useMemo(() => {
        return { items, value, setValue };
    }, [items, value, setValue]);
}
