/**
 * @description This is refactored
 */
export interface Logger {
    trace(name: string, message: string): void;
    debug(name: string, message: string): void;
    info(name: string, message: string): void;
    warn(name: string, message: string): void;
    error(name: string, message: string): void;
    fatal(name: string, message: string): void;
    mark(name: string, message: string): void;
}
