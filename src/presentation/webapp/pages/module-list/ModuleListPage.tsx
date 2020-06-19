import i18n from "@dhis2/d2-i18n";
import React, { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { ModulesListTable } from "../../../common/components/module-list-table/ModuleListTable";
import Dropdown from "../../components/dropdown/Dropdown";
import PageHeader from "../../components/page-header/PageHeader";
import { PackagesListTable } from "../../../common/components/package-list-table/PackageListTable";

export const ModuleListPage: React.FC = () => {
    const history = useHistory();
    const [tableOption, setTableOption] = useState<string>("modules");
    const title = buildTitle(tableOption);

    const backHome = () => {
        history.push("/");
    };

    const createModule = () => {
        history.push(`/modules/new`);
    };

    const filters = useMemo(
        () => (
            <Dropdown
                items={[
                    { id: "modules", name: i18n.t("Modules") },
                    { id: "packages", name: i18n.t("Packages") },
                ]}
                value={tableOption}
                onValueChange={setTableOption}
                label={i18n.t("View")}
            />
        ),
        [tableOption]
    );

    return (
        <React.Fragment>
            <PageHeader title={title} onBackClick={backHome} />

            {tableOption === "modules" && (
                <ModulesListTable externalComponents={filters} onActionButtonClick={createModule} />
            )}

            {tableOption === "packages" && <PackagesListTable externalComponents={filters} />}
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
