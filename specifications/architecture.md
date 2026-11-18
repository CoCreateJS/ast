# Architecture

`@cocreate/ast` owns CoCreate's declarative abstract syntax tree evaluator. AST
input is structured data that the evaluator interprets; the package does not
parse or execute JavaScript source.

The package has client and server entry points selected through package export
conditions. Both expose the shared evaluator and operator implementation. The
client entry registers browser roots. The server entry registers shared roots
plus documented Node.js built-ins and CoCreate server helpers.

The evaluator owns its shared value, query, file, and object helpers. This
keeps the package independent while exposing the evaluator as its own public
package.

AST roots are capabilities available to an evaluation. The server entry can
expose Node process capabilities to workflows, so the evaluator is not a
security boundary for untrusted input.
