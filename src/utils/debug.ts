// Handle both Vite and Node.js environments
const isNodeEnv = typeof process !== "undefined" && process.env;

const getMode = (): string => {
    if (isNodeEnv) {
        return process.env.NODE_ENV || "production";
    }
    return "production";
};

const isDevelopment = getMode() === "development";
const isTest = isNodeEnv ? process.env.NODE_ENV === "test" || process.env.VITEST !== undefined : false;

export const debug = (...message: unknown[]) => {
    if (isDevelopment && !isTest) console.debug("[MDSync]", ...message);
};
