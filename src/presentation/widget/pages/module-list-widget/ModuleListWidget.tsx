import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Instance } from "../../../../domain/instance/entities/Instance";
import i18n from "../../../../locales";
import { ModulesListTable } from "../../../common/components/module-list-table/ModuleListTable";
import { PackagesListTable } from "../../../common/components/package-list-table/PackageListTable";
import { useAppContext } from "../../../common/contexts/AppContext";
import Dropdown from "../../../webapp/components/dropdown/Dropdown";

export const ModuleListWidget: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const [tableOption, setTableOption] = useState<string>("modules");
    const [instances, setInstances] = useState<Instance[]>([]);
    const [selectedInstance, setSelectedInstance] = useState<Instance>();

    const updateSelectedInstance = useCallback(
        (id: string) => {
            setSelectedInstance(instances.find(instance => instance.id === id));
        },
        [instances]
    );

    const filters = useMemo(
        () => (
            <React.Fragment>
                <Dropdown
                    items={[{ id: "LOCAL", name: i18n.t("This instance") }, ...instances]}
                    value={selectedInstance?.id ?? "LOCAL"}
                    onValueChange={updateSelectedInstance}
                    label={i18n.t("Instance")}
                    hideEmpty={true}
                />
                <Dropdown
                    items={[
                        { id: "modules", name: i18n.t("Modules") },
                        { id: "packages", name: i18n.t("Packages") },
                    ]}
                    value={tableOption}
                    onValueChange={setTableOption}
                    label={i18n.t("View")}
                    hideEmpty={true}
                />
            </React.Fragment>
        ),
        [tableOption, setTableOption, instances, selectedInstance, updateSelectedInstance]
    );

    useEffect(() => {
        compositionRoot.instances().list().then(setInstances);
    }, [compositionRoot]);

    const Table = tableOption === "packages" ? PackagesListTable : ModulesListTable;

    return (
        <Table
            externalComponents={filters}
            presentation={"widget"}
            remoteInstance={selectedInstance}
            pageSizeOptions={[10]}
        />
    );
});
