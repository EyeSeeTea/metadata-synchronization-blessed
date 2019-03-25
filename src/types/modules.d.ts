declare module "d2/uid" {
    export function generateUid(): string;
}

declare module "cryptr" {
    interface CryptrConstructor {
        new (key: string): function;
    }
    const Cryptr: CryptrConstructor;
    export = Cryptr;
}
