import qs from "qs";
import { useEffect, useState } from "react";
import { HashRouter } from "react-router-dom";
import { Dictionary } from "../../../types/utils";

function useWidget(): { dashboardItemId: string; userOrgUnits: string[]; widget: string } {
    const widget = process.env.REACT_APP_PRESENTATION_VARIANT;
    if (!widget) {
        throw new Error("Attempting to use useWidget on application");
    }

    const { dashboardItemId = "DEVELOPMENT", userOrgUnit } = qs.parse(window.location.search) as Dictionary<string>;

    return {
        dashboardItemId,
        userOrgUnits: userOrgUnit?.split(",") ?? [],
        widget,
    };
}

const loadWidget = async (widget: string): Promise<Function> => {
    switch (widget) {
        case "modules-list": {
            const { ModuleListWidget } = await import("./module-list-widget/ModuleListWidget");
            return ModuleListWidget;
        }
        case "package-exporter": {
            const { PackageExporterWidget } = await import("./package-exporter-widget/PackageExporterWidget");
            return PackageExporterWidget;
        }
        default: {
            return () => {
                const { dashboardItemId } = useWidget();
                return () => <p>{`Hello World, I'm dashboard item ${dashboardItemId}!`}</p>;
            };
        }
    }
};

function Root() {
    const { widget } = useWidget();
    const [Component, setComponent] = useState<Function>();

    useEffect(() => {
        loadWidget(widget).then(setComponent);
    }, [widget]);

    return Component ? (
        <HashRouter>
            <Component />
        </HashRouter>
    ) : null;
}

export default Root;
