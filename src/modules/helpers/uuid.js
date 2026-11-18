const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

function randomBytes(length) {
    const bytes = new Uint8Array(length);
    const cryptoObj = isBrowser ? (window.crypto || window.msCrypto) : globalThis.crypto;

    if (cryptoObj && cryptoObj.getRandomValues) {
        cryptoObj.getRandomValues(bytes);
    } else {
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }

    return bytes;
}

/** Generates a full UUIDv7 with a millisecond Unix timestamp prefix. */
export function uuid() {
    const bytes = randomBytes(16);
    let timestamp = Date.now();

    for (let i = 5; i >= 0; i--) {
        bytes[i] = timestamp & 0xff;
        timestamp = Math.floor(timestamp / 256);
    }

    bytes[6] = (bytes[6] & 0x0f) | 0x70;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Generates a random hexadecimal UID of the requested length. */
export function uid(length = 8) {
    const targetLength = Math.max(0, Math.min(Math.floor(Number(length) || 0), 36));
    return Array.from(randomBytes(Math.ceil(targetLength / 2)), byte => byte.toString(16).padStart(2, "0"))
        .join("")
        .substring(0, targetLength);
}
