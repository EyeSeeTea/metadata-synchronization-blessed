// @ts-ignore
import MD5 from "md5.js";

// DHIS2 UID :: /^[a-zA-Z][a-zA-Z0-9]{10}$/
const asciiLetters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const asciiNumbers = "0123456789";
const asciiLettersAndNumbers = asciiLetters + asciiNumbers;
const uidSize = 10;
const range = Array.from(new Array(uidSize).keys());
const uidStructure = [asciiLetters, ...range.map(() => asciiLettersAndNumbers)];
const maxHashValue = uidStructure.map(cs => cs.length).reduce((acc, n) => acc * n, 1);

/* Return pseudo-random UID from seed string */
export function getUid(seed: string): string {
    const md5hash: string = new MD5().update(seed).digest("hex");
    const nHashChars = Math.ceil(Math.log(maxHashValue) / Math.log(16));
    const hashInteger = parseInt(md5hash.slice(0, nHashChars), 16);
    const result = uidStructure.reduce(
        (acc, chars) => {
            const { n, uid } = acc;
            const nChars = chars.length;
            const quotient = Math.floor(n / nChars);
            const remainder = n % nChars;
            const uidChar = chars[remainder];
            return { n: quotient, uid: uid + uidChar };
        },
        { n: hashInteger, uid: "" }
    );

    return result.uid;
}

function randomWithMax(max: number) {
    return Math.floor(Math.random() * max);
}

export function generateUid(): string {
    // First char should be a letter
    let randomChars = asciiLetters.charAt(randomWithMax(asciiLetters.length));

    for (let i = 1; i <= uidSize; i += 1) {
        randomChars += asciiLettersAndNumbers.charAt(randomWithMax(asciiLettersAndNumbers.length));
    }

    return randomChars;
}

const fullUidRegex = /^[a-zA-Z]{1}[a-zA-Z0-9]{10}$/;

export function isValidUid(code: string | undefined | null): boolean {
    return !!code && fullUidRegex.test(code);
}
