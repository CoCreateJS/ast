# CoCreate Evaluate

`@cocreate/evaluate` evaluates CoCreate's declarative abstract syntax tree format in
browser and Node.js environments. An AST is data: its nodes describe values,
operations, control flow, and calls to explicitly available functions. The
package evaluates that structure without parsing or executing JavaScript source.

```js
import { evaluateAsync } from '@cocreate/evaluate';

const result = await evaluateAsync({
    executeAST: { '$concat': ['Hello, ', '$name'] },
    sandbox: { '$name': 'CoCreate' }
});
```

The package exports `evaluateSync` and `evaluateAsync` as the primary evaluators. Use the
async evaluator when AST operations may await asynchronous functions. The
optional `node` and `sandbox` values make runtime context and available
capabilities explicit:

```js
await evaluateAsync({
    node: element,
    sandbox: { '$loadRecord': loadRecord, '$recordId': 'record-123' },
    executeAST: {
        record: { '$loadRecord': ['$recordId'] },
        '$return': '$record'
    }
});
```

## Package entry points

Node.js selects the server entry, and browser bundlers select the client entry
from the same package root. Each entry registers the built-in roots for its
environment.

```js
import Evaluate, { evaluateSync, evaluateAsync } from "@cocreate/evaluate";

const result = await Evaluate({ executeAST: "$value" });
```

## Evaluator API

| Export | Description |
| --- | --- |
| `Evaluate(options)` (default) | Async evaluator selected for the current environment. |
| `evaluateSync(options)` | Evaluate an AST synchronously. |
| `evaluateAsync(options)` | Evaluate an AST and await asynchronous operations. |
| `evaluateAST(options)` | Async evaluator alias accepting `node`, `executeAST`, and `sandbox`. |
| `registerASTGlobals(globals)` | Register additional named roots in the active evaluator scope. |
| `processOperators(value, ...)` | Resolve CoCreate operator expressions synchronously. |
| `processOperatorsAsync(value, ...)` | Resolve CoCreate operator expressions asynchronously. |
| `customOperators` | Registry used by the operator evaluator. |
| `isomorphicSandbox` | Shared base scope for browser and server environments. |

Both evaluators accept an options object with `executeAST`, optional `node`,
and optional `sandbox` fields. The `sandbox` object supplies values and
functions that the AST may resolve. See the [API specification](specifications/api.md)
and [architecture](specifications/architecture.md) for details.

## Syntax and capabilities

CoCreate Evaluate uses JSON-compatible structures and named `$` operations. It
supports nested values, property access and assignment, conditionals, functions,
iteration, and control flow such as `$return`, `$break`, and `$continue`. The
available roots depend on the environment: shared JavaScript and Web APIs are
available in both, browser roots are registered in a browser, and documented
Node.js modules are registered by the server entry.

The evaluator does not parse or execute JavaScript source. Calls resolve from
registered roots, the supplied sandbox, or values constructed by the AST.
Server roots expose process capabilities; they are not a security boundary
around workflow execution.

### Assign nested AST results

A dotted operator key identifies a property on an existing scoped object. When
that member is not a function, AST evaluates the nested value, assigns the
result to the property, and returns that result:

```js
await evaluateAsync({
    node: element,
    sandbox: { $this: element, $ExamplePlugin: ExamplePlugin },
    executeAST: {
        "$this.myInstance": { "$ExamplePlugin": ["$this", {}] }
    }
});
```

This works in both `evaluateSync` and `evaluateAsync`, including multiple sibling keys,
nested paths, numeric array indices, and `items[]` appends. AST resolves the
root from its sandbox or registry and delegates writes to `dotNotationToObject`.
The root object must exist; missing parent objects are created by the shared
helper. Its conventions apply: `undefined` deletes a property, and assigning
`undefined` to an indexed array entry splices that entry out.
Existing callable members retain method invocation semantics. A string such as
`"$this.myInstance"` still reads a value; ordinary keys still store values in
the AST result and scope. Returned results are not automatically assigned to
the host element by the plugin loader.

### Browser globals in AST

In browser evaluations, `$window` reads the browser window and `$CoCreate`
reads its current `window.CoCreate` namespace. Both support dotted property
reads, assignment keys, and method calls in `evaluateSync` and `evaluateAsync`:

```js
evaluateSync({ executeAST: "$window.location.origin" });
evaluateSync({ executeAST: "$CoCreate" });
await evaluateAsync({ executeAST: { "$window.exampleSettings": { enabled: true } } });
```

The globals resolve at evaluation time, so CoCreate may load after AST.
OperatorJS expressions can also use `$($window.innerWidth)` and
`$($CoCreate.someProperty)`, or the browser's normal `window` and `CoCreate`
names inside `$()`.

### Synchronous and asynchronous callbacks

`$function` creates a synchronous callback in both `evaluateSync` and `evaluateAsync`.
Creating the callback does not execute its body. Wrap it in `$async` to create
an asynchronous callback whose body uses `evaluateAsync` and returns a Promise:

```json
{
    "$async": {
        "$function": {
            "params": ["value"],
            "body": { "$await": "$value" }
        }
    }
}
```

Both forms preserve the surrounding scope, parameters, and optional `bind`.
`$await` requires asynchronous evaluation; a synchronous callback rejects it.
A synchronous callback can still return a Promise directly without awaiting
it. Async configuration evaluation does not change a callback's declaration.

### Loop and function control

Use `"$break"` to exit the nearest `$for`, and `"$continue"` to skip the rest
of its current iteration. Both work inside nested `$if` branches:

```json
{
    "$for": {
        "$items": {
            "item": {
                "skip": {
                    "$if": {
                        "$item.status": {
                            "$eq": { "disabled": "$continue" }
                        }
                    }
                },
                "stop": {
                    "$if": {
                        "$item.status": {
                            "$eq": { "finished": "$break" }
                        }
                    }
                },
                "process": { "$processItem": "$item" }
            }
        }
    }
}
```

Object forms such as `{ "$break": true }` and `{ "$continue": false }` also
execute unconditionally. Their payloads are ignored and never evaluated.
A conditional belongs in `$if`; setting the payload to `false` does not disable
the command. These names are reserved when used as executable values or keys.

`{ "$return": value }` evaluates its value and exits the current AST function,
including through nested conditions and loops. Bare `"$return"` exits with
`undefined`. At an AST entry point outside a callback, return ends that
evaluation. Existing implicit function results remain supported.

Break and continue cannot cross a `$function` or `$async` function boundary;
using either without an enclosing loop in that function throws a `SyntaxError`.
All forms work in `evaluateSync` and `evaluateAsync`, including `$for` with `$await` in
async evaluation. Breaking or returning closes the iterator as JavaScript does.
Labeled break and continue are not supported.

Async arrays inside loop and function bodies execute in order so later steps
do not start after break, continue, or return. Other async arrays retain their
concurrent evaluation; use an object for sequential steps at an entry point.

### While and do-while loops

Put `$do` before `$while` to run the body once before testing whether to repeat.
For example, poll an API until it returns the boolean `true`:

```json
{
    "$do": {
        "ready": { "$TestAPI": [] }
    },
    "$while": "$($ready !== true)"
}
```

`TestAPI` is an application function supplied in the sandbox, not a built-in
operator. Use `evaluateAsync` for asynchronous requests: each call is awaited before
testing the condition, and requests execute one at a time. The example is
equivalent to:

```js
let ready;
do {
    ready = await TestAPI();
} while (ready !== true);
```

Put `$while` before `$do` for a JavaScript-style `while` loop that checks first
and may execute zero times:

```json
{
    "$while": "$($state.count < 10)",
    "$do": {
        "$state.count": "$($state.count + 1)"
    }
}
```

The pair must be the only two keys in its object; their order determines which
loop runs. Nest that object under a named step when composing a larger flow.
The condition is reevaluated on every check using JavaScript truthiness. It
can be an expression, a scoped value, or another AST operation. Async
evaluation also awaits condition results.

The body shares its surrounding scope, so values such as `ready` written in
the body are available to the condition and following steps. Body arrays run
sequentially. `$continue` jumps to the next condition check; `$break` exits the
nearest `$while` or `$for` without checking again. `$return` exits the current
function or AST entry point. Function boundaries still isolate loop control.

There is no iteration limit. A condition of `true` repeats until the body
breaks, returns, or throws; the AST author controls termination.

### Native AST roots

AST exposes native APIs as top-level roots, so their methods can be composed
without adding an operator for each method. Shared roots include `$Promise`,
`$URL`, `$TextEncoder`, typed arrays, Fetch APIs, Web Streams, timers, and the
standard JavaScript collections and error constructors. Optional globals are
`undefined` when the environment does not provide them. Existing CoCreate
helpers remain available.

Import `evaluateSync` or `evaluateAsync` from `@cocreate/evaluate` in Node to register the
server scope. It adds `$crypto`, `$fs`, `$buffer`, `$Buffer`, `$util`, `$process`,
and the other enabled public top-level Node modules, plus the KMS `$kms` namespace.
Native modules load on access using Node's
[`process.getBuiltinModule`](https://nodejs.org/api/process.html#processgetbuiltinmoduleid).
The explicit list is in `src/modules/evaluate/serverGlobals.js`; unsupported entries
such as `ffi` remain commented beside the active entries. Currently unused
`dgram`, `sqlite`, and `repl` are also commented out and can be enabled later.
Deprecated modules (`constants`, `domain`, `punycode`, and `sys`) are omitted.
Each registry entry includes a short description of its purpose.

```json
{
    "generate": { "$util.promisify": "$crypto.generateKeyPair" },
    "pair": { "$generate": ["ed25519", {}] },
    "$return": {
        "$pair.publicKey.export": { "type": "spki", "format": "pem" }
    }
}
```

Use `evaluateAsync` for this example. Namespaced methods retain their native receiver,
and return values can be stored and used in later steps. APIs such as
`$fs.promises.readFile` are available through their module root. Explicit
sandbox bindings can override defaults for an individual evaluation.

In a browser, `$crypto` is native Web Crypto, also reachable as `$window.crypto`.
On the server, `$crypto` is Node's crypto module; its Web Crypto API is available
under `$crypto.webcrypto`. Node-only imports stay out of the browser bundle.
The package root selects the client entry in browser bundlers and the server
entry in Node.js. Both expose the same evaluator API; the server entry registers
additional Node roots.

Server APIs execute with the Node process's permissions. Registering these roots
provides capabilities; it does not isolate workflow execution from the host.

For the complete API contract, see the [API specification](specifications/api.md)
and [architecture](specifications/architecture.md).
