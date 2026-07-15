// Global fail function for jest backward compatibility
declare global {
    function fail(reason?: any): never;
}

globalThis.fail = (reason?: any) => {
    throw new Error(reason);
};

// Force fetch through XHR-based polyfill so Mirage/Pretender can intercept requests in tests.
if (typeof window !== "undefined") {
    // whatwg-fetch does not replace an existing fetch implementation automatically.
    delete (window as any).fetch;
    const { fetch, Headers, Request, Response } = require("whatwg-fetch");
    window.fetch = fetch.bind(window);
    (window as any).Headers = Headers;
    (window as any).Request = Request;
    (window as any).Response = Response;
    globalThis.fetch = window.fetch.bind(window);
}

export {};
