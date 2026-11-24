import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateAsync, evaluateSync } from '../src/modules/evaluate/index.js';

test('AST can stop a pipeline with a defined error in sync and async execution', async () => {
    const pipeline = {
        check: { $throw: 'The required record is unavailable.' },
        request: { '$send': [] }
    };
    const sandbox = { send: () => assert.fail('Execution must stop before sending') };
    assert.throws(() => evaluateSync({ executeAST: pipeline, sandbox }), /required record is unavailable/);
    await assert.rejects(evaluateAsync({ executeAST: pipeline, sandbox }), /required record is unavailable/);
});
