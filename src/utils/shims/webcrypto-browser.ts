// this is a shim for the browser environment.
// @peculiar/webcrypto is aliased to this file in vite.config.ts
// re-export the global crypto object which is available in modern browsers

const native = globalThis.crypto;

if (!native) throw new Error("WebCrypto is not available in this environment.");

// Make `new Crypto()` return the native singleton
export class Crypto {
    constructor() {
        return native;
    }
}
