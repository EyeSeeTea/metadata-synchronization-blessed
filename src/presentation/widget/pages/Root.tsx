import qs from "qs";
import React, { ReactNode, useEffect, useState } from "react";

export function useWidget() {
    const { dashboardItemId = "DEVELOPMENT", userOrgUnit } = qs.parse(window.location.search);

    return {
        dashboardItemId,
        userOrgUnits: userOrgUnit?.split(",") ?? [],
        widget: "modules-list",
    };
}

const loadWidget = async (widget: string) => {
    switch (widget) {
        case "modules-list":
            const { ModulesListWidget } = await import("./modules-list-widget/ModulesListWidget");
            return ModulesListWidget;
        default:
            return () => {
                const { dashboardItemId } = useWidget();
                return <p>{`Hello World, I'm dashboard item ${dashboardItemId}!`}</p>;
            };
    }
};

function Root() {
    const { widget } = useWidget();
    const [Component, setComponent] = useState<ReactNode>(null);

    useEffect(() => {
        loadWidget(widget).then(setComponent);
    }, [widget]);

    return Component;
}

export default Root;
