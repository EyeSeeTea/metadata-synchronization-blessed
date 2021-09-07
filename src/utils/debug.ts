const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.JEST_WORKER_ID !== undefined;

export const debug = (...message: unknown[]) => {
    if (isDevelopment && !isTest) console.debug("[MDSync]", ...message);
};
