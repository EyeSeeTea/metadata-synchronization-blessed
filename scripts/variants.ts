import { ArrayElementType } from "../src/types/utils";

export const variants = [
    {
        type: "app",
        name: "core-app",
        title: "MetaData Synchronization",
        file: "metadata-synchronization",
    },
    {
        type: "app",
        name: "data-metadata-app",
        title: "Data/Metadata Exchange",
        file: "metadata-synchronization-data-metadata-exchange",
    },
    {
        type: "app",
        name: "module-package-app",
        title: "Module/Package Generation",
        file: "metadata-synchronization-module-package-generation",
    },
    {
        type: "app",
        name: "msf-aggregate-data-app",
        title: "MSF Aggregate Data",
        file: "metadata-synchronization-msf-aggregate-data",
    },
    {
        type: "widget",
        name: "modules-list",
        title: "MetaData Synchronization Modules List Widget",
        file: "metadata-synchronization-widget-modules-list",
    },
    {
        type: "widget",
        name: "package-exporter",
        title: "MetaData Synchronization Package Exporter Widget",
        file: "metadata-synchronization-widget-package-exporter",
    },
    {
        type: "app",
        name: "sp-emergency-responses",
        title: "Emergency Responses Sync",
        file: "emergency-responses-sync",
    },
    {
        type: "app",
        name: "wmr",
        title: "WMR Data Submission",
        file: "wmr-data-submission",
    },
] as const;

export type VariantKeys = ArrayElementType<typeof variants>["name"];
