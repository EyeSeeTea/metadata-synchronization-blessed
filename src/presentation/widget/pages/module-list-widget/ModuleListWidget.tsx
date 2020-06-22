import i18n from "@dhis2/d2-i18n";
import _ from "lodash";
import React, { useMemo, useState } from "react";
import { ModulesListTable } from "../../../common/components/module-list-table/ModuleListTable";
import { PackagesListTable } from "../../../common/components/package-list-table/PackageListTable";
import Dropdown from "../../../webapp/components/dropdown/Dropdown";

export const ModuleListWidget: React.FC = React.memo(() => {
    const [tableOption, setTableOption] = useState<string>("modules");

    const filters = useMemo(
        () => (
            <React.Fragment>
                <Dropdown
                    items={[
                        { id: "local", name: i18n.t("Local instance") },
                    ]}
                    value={"local"}
                    onValueChange={_.noop}
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
        [tableOption, setTableOption]
    );

    return (
        <React.Fragment>
            {tableOption === "modules" && (
                <ModulesListTable externalComponents={filters} presentation={"widget"} />
            )}

            {tableOption === "packages" && (
                <PackagesListTable externalComponents={filters} presentation={"widget"} />
            )}
        </React.Fragment>
    );
});
