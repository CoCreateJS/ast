import assert from "node:assert/strict";
import test from "node:test";
import { evaluateAsync, evaluateSync } from "../src/modules/evaluate/index.js";

test("AST preserves explicit undefined and null operators", async () => {
    const node = {};

    assert.equal(evaluateSync({ executeAST: "$undefined", node }), undefined);
    assert.equal(evaluateSync({ executeAST: "$null", node }), null);
    assert.equal(await evaluateAsync({ executeAST: "$undefined", node }), undefined);
    assert.equal(await evaluateAsync({ executeAST: "$null", node }), null);
});

test("AST preserves an unknown operator instead of treating it as undefined", async () => {
    const node = {};

    assert.equal(evaluateSync({ executeAST: "$unknownOperator", node }), "$unknownOperator");
    assert.equal(
        await evaluateAsync({ executeAST: "$unknownOperator", node }),
        "$unknownOperator"
    );
});
