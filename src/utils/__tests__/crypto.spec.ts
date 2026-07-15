import { encrypt, decrypt } from "../crypto";

describe("crypto utils", () => {
    const key = "mySecretKey123!@#";
    const plaintext = "Hello, world! 👋🌍";
    const emptyText = "";
    const unicodeText = "秘密のメッセージ";

    it("should encrypt and decrypt a string correctly", async () => {
        const encrypted = await encrypt(plaintext, key);
        expect(typeof encrypted).toBe("string");
        expect(encrypted).not.toBe(plaintext);

        const decrypted = await decrypt(encrypted, key);
        expect(decrypted).toBe(plaintext);
    });

    it("should encrypt and decrypt an empty string", async () => {
        const encrypted = await encrypt(emptyText, key);
        expect(typeof encrypted).toBe("string");
        expect(encrypted).not.toBe(emptyText);

        const decrypted = await decrypt(encrypted, key);
        expect(decrypted).toBe(emptyText);
    });

    it("should encrypt and decrypt unicode text", async () => {
        const encrypted = await encrypt(unicodeText, key);
        expect(typeof encrypted).toBe("string");
        expect(encrypted).not.toBe(unicodeText);

        const decrypted = await decrypt(encrypted, key);
        expect(decrypted).toBe(unicodeText);
    });

    it("should produce different ciphertexts for same plaintext (random IV)", async () => {
        const encrypted1 = await encrypt(plaintext, key);
        const encrypted2 = await encrypt(plaintext, key);
        expect(encrypted1).not.toBe(encrypted2);
    });

    it("should be retrocompatible with Cryptr v4 - known encrypted values", async () => {
        const knownValues = [
            {
                plaintext: "password",
                key: "test",
                cypherText: "fabbfd4cd11c26bc446bdec264c5ec56c79a15b179c7c816",
            },
            {
                plaintext: 'passwordInstance!&/"!#%',
                key: "key w1th.character$____",
                cypherText: "05b2d1a302c0baf69851d7603c70c6f64ff5914f1d919220059eae816c6b525123b0f4c066daef",
            },
        ];
        for (const { plaintext, key, cypherText } of knownValues) {
            const decrypted = await decrypt(cypherText, key);
            expect(decrypted).toBe(plaintext);
        }
    });
});
