import i18n from "@dhis2/d2-i18n";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { ModulesListTable } from "../../../common/components/module-list-table/ModuleListTable";
import { PackagesListTable } from "../../../common/components/package-list-table/PackageListTable";
import { useAppContext } from "../../../common/contexts/AppContext";
import Dropdown from "../../components/dropdown/Dropdown";
import PageHeader from "../../components/page-header/PageHeader";

export const ModuleListPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const [instances, setInstances] = useState<Instance[]>([]);
    const [selectedInstance, setSelectedInstance] = useState<Instance>();

    const { list: tableOption = "modules" } = useParams<{ list: "modules" | "packages" }>();
    const title = buildTitle(tableOption);

    const backHome = useCallback(() => {
        history.push("/");
    }, [history]);

    const createModule = useCallback(() => {
        history.push(`/modules/new`);
    }, [history]);

    const setTableOption = useCallback(
        (option: string) => {
            history.push(`/${option}`);
        },
        [history]
    );

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
        compositionRoot
            .instances()
            .list()
            .then(setInstances);
    }, [compositionRoot]);

    return (
        <React.Fragment>
            <PageHeader title={title} onBackClick={backHome} />

            {tableOption === "modules" && (
                <ModulesListTable
                    externalComponents={filters}
                    onActionButtonClick={!selectedInstance ? createModule : undefined}
                    instance={selectedInstance}
                />
            )}

            {tableOption === "packages" && (
                <PackagesListTable externalComponents={filters} instance={selectedInstance} />
            )}
        </React.Fragment>
    );
};

function buildTitle(tableOption: string) {
    switch (tableOption) {
        case "modules":
            return i18n.t("Modules");
        case "packages":
            return i18n.t("Packages");
        default:
            return "";
    }
}

export default ModuleListPage;
