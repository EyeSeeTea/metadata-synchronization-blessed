export type Debug = (log: Log) => void;

export type Log = {
    message: string;
    level?: LogLevel;
};
export type LogLevel = "info" | "warning";
