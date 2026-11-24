import {
    evaluateSync as evaluateSyncBase,
    evaluateAsync as evaluateAsyncBase,
    registerASTGlobals
} from "./index.js";
import { serverGlobalsScope } from "./serverGlobals.js";

registerASTGlobals(serverGlobalsScope);

// Keep registration with the server entry when bundlers follow these exports.
export function evaluateSync(options) {
    return evaluateSyncBase(options);
}

export async function evaluateAsync(options) {
    return await evaluateAsyncBase(options);
}

export default evaluateSync;
