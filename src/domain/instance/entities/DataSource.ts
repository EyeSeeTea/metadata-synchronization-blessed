import { Instance } from "./Instance";
import { JSONDataSource } from "./JSONDataSource";

export type DataSourceType = "local" | "dhis" | "json";

export type DataSource = Instance | JSONDataSource;

export const isDhisInstance = (source: DataSource): source is Instance => {
    return source.type === "dhis" || source.type === "local";
};

export const isJSONDataSource = (source: DataSource): source is JSONDataSource => {
    return source.type === "json";
};
