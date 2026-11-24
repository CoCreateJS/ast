import assert from "node:assert/strict";
import test from "node:test";
import { evaluateSync, evaluateAsync } from "../src/modules/evaluate/index.js";

// Import the shared evaluator directly so server registration cannot mask gaps.
test("shared native roots work without importing the server entry", async () => {
    assert.equal(evaluateSync({ executeAST: "$Promise" }), Promise);
    assert.equal(evaluateSync({ executeAST: "$crypto" }), globalThis.crypto);
    assert.equal(evaluateSync({ executeAST: "$TextEncoder" }), TextEncoder);
    assert.equal(evaluateSync({ executeAST: "$globalThis" }), globalThis);
    const result = await evaluateAsync({ executeAST: {
        encoder: { "$TextEncoder": [] },
        bytes: { "$encoder.encode": ["abc"] },
        $return: { "$crypto.subtle.digest": ["SHA-256", "$bytes"] }
    } });
    assert.equal(Buffer.from(result).toString("hex"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("native global functions keep their global receiver", async t => {
    t.mock.method(globalThis, "fetch", async function (url) {
        assert.equal(this, globalThis);
        return new Response(url);
    });
    assert.equal(await evaluateAsync({ executeAST: {
        response: { "$fetch": ["native response"] },
        $return: { "$response.text": [] }
    } }), "native response");
});
