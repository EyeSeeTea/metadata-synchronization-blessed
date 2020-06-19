import React from "react";
import { ModulesListTable } from "../../../common/components/modules-list-table/ModulesListTable";

export const ModulesListWidget: React.FC = () => {
    return (
        <React.Fragment>
            <ModulesListTable presentation={"widget"} />
        </React.Fragment>
    );
};
