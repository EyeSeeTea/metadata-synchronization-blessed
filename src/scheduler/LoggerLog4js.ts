import { configure, getLogger } from "log4js";
import { Logger } from "./SchedulerCLI/Logger";

/**
 * @description This file is refactored.
 */
export default class LoggerLog4js implements Logger {
    constructor(isDevelopment: boolean) {
        configure({
            appenders: {
                out: { type: "stdout" },
                file: { type: "file", filename: "debug.log" },
            },
            categories: { default: { appenders: ["file", "out"], level: isDevelopment ? "all" : "debug" } },
        });
    }

    trace(name: string, message: string): void {
        getLogger(name).trace(message);
    }

    debug(name: string, message: string): void {
        getLogger(name).debug(message);
    }

    info(name: string, message: string): void {
        getLogger(name).info(message);
    }

    warn(name: string, message: string): void {
        getLogger(name).warn(message);
    }

    error(name: string, message: string): void {
        getLogger(name).error(message);
    }

    fatal(name: string, message: string): void {
        getLogger(name).fatal(message);
    }

    mark(name: string, message: string): void {
        getLogger(name).mark(message);
    }
}
