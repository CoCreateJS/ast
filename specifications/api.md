# API

## Evaluators

The default export is the asynchronous evaluator selected for the current environment.

`evaluateSync(options)` evaluates `options.executeAST` and returns its result.
`evaluateAsync(options)` evaluates the same format and awaits supported asynchronous
operations. `evaluateAST(options)` is an alias for asynchronous evaluation.

Options may include:

| Option | Description |
| --- | --- |
| `executeAST` | AST value or structure to evaluate. |
| `node` | Optional host node used by node-aware operations. |
| `sandbox` | Additional named roots available during this evaluation. |

Both evaluators also support global roots registered for the selected package
entry. `registerASTGlobals(globals)` adds roots to the active evaluator scope.
The operator helpers `processOperators`, `processOperatorsAsync`, and the
`customOperators` registry are exported for integrations that need to resolve
operator expressions directly.

## Environment selection

The package root selects the Node entry in Node.js and the browser entry in
browser-aware bundlers. Both entries expose the same evaluator API and shared
syntax. Browser globals are registered by the client entry; Node built-ins and
CoCreate KMS server helpers are registered by the server entry.
