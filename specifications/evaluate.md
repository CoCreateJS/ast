# AST syntax

AST values use JSON-compatible structures. Operation names use `$`-prefixed
keys and are interpreted by the evaluator. Ordinary keys build result objects;
registered roots can be read, invoked, or assigned through their supported
operation forms.

The evaluator supports conditional operators, query and value operators,
functions, synchronous and asynchronous operations, iteration, and control
flow. `$return` exits the current AST function or entry evaluation. `$break`
and `$continue` target the nearest loop in the current function. They cannot
cross a function boundary. `$while` is a pre-test loop; placing `$do` before
`$while` runs the body before checking the condition.

Async work inside loop and function bodies executes sequentially so control
flow has predictable effects. Other async arrays may execute concurrently.
Consult the evaluator tests and examples in the package guide for concrete
forms; operation behavior is part of the CoCreate AST contract.
