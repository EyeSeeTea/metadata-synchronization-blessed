import React from "react";
import { ModulesListTable } from "../../../common/components/module-list-table/ModuleListTable";

export const ModulesListWidget: React.FC = () => {
    return (
        <React.Fragment>
            <ModulesListTable presentation={"widget"} />
        </React.Fragment>
    );
};
